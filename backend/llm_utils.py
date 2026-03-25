from __future__ import annotations

import json
import os
import re
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


def load_env_file(path: str) -> None:
    if not os.path.exists(path):
        return

    with open(path, encoding="utf-8") as handle:
        for raw_line in handle:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip("'").strip('"')

            if key and key not in os.environ:
                os.environ[key] = value


def get_llm_config() -> dict[str, str] | None:
    provider = os.getenv("LLM_PROVIDER", "").strip().lower()

    if not provider:
        if os.getenv("ANTHROPIC_API_KEY"):
            provider = "anthropic"
        elif os.getenv("OPENAI_API_KEY") or os.getenv("LLM_API_KEY"):
            provider = "openai_compatible"
        else:
            return None

    if provider == "anthropic":
        api_key = os.getenv("ANTHROPIC_API_KEY") or os.getenv("LLM_API_KEY")
        if not api_key:
            return None

        return {
            "provider": provider,
            "api_key": api_key,
            "model": os.getenv("ANTHROPIC_MODEL") or os.getenv("LLM_MODEL") or "claude-3-7-sonnet-latest",
            "api_url": os.getenv("ANTHROPIC_API_URL") or os.getenv("LLM_API_URL") or "https://api.anthropic.com/v1/messages",
            "anthropic_version": os.getenv("ANTHROPIC_VERSION") or "2023-06-01",
        }

    api_key = os.getenv("OPENAI_API_KEY") or os.getenv("LLM_API_KEY")
    if not api_key:
        return None

    return {
        "provider": "openai_compatible",
        "api_key": api_key,
        "model": os.getenv("OPENAI_MODEL") or os.getenv("LLM_MODEL") or "gpt-4.1-mini",
        "api_url": os.getenv("OPENAI_API_URL") or os.getenv("LLM_API_URL") or "https://api.openai.com/v1/chat/completions",
    }


def extract_json_object(text: str) -> dict[str, object]:
    cleaned = text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*|\s*```$", "", cleaned, flags=re.IGNORECASE | re.DOTALL).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, flags=re.DOTALL)
        if not match:
            raise ValueError("LLM response did not contain a JSON object.")

        return json.loads(match.group(0))


def request_llm_query_plan(question: str, schema_prompt: str) -> dict[str, object] | None:
    config = get_llm_config()
    if not config:
        return None

    system_prompt = (
        "You are a DuckDB SQL planner for a loan analytics dashboard. "
        "Return JSON only with keys sql, chart_type, x_field, y_fields, title, explanation. "
        "sql must be a single read-only SELECT or WITH query. "
        "chart_type must be one of metric, bar, line, table. "
        "y_fields must be an array of column names. "
        "Never return markdown or code fences.\n\n"
        f"{schema_prompt}"
    )

    user_prompt = (
        "Translate the natural-language request into SQL for the dataset and propose the best chart.\n"
        f"Request: {question}"
    )

    if config["provider"] == "anthropic":
        payload = {
            "model": config["model"],
            "max_tokens": 900,
            "temperature": 0,
            "system": system_prompt,
            "messages": [{"role": "user", "content": user_prompt}],
        }
        headers = {
            "content-type": "application/json",
            "x-api-key": config["api_key"],
            "anthropic-version": config["anthropic_version"],
        }
        raw_response = _post_json(config["api_url"], headers, payload)
        content_items = raw_response.get("content", [])
        text = "".join(item.get("text", "") for item in content_items if item.get("type") == "text")
        return normalize_query_plan(extract_json_object(text))

    payload = {
        "model": config["model"],
        "temperature": 0,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
    }
    headers = {
        "content-type": "application/json",
        "authorization": f"Bearer {config['api_key']}",
    }
    raw_response = _post_json(config["api_url"], headers, payload)
    choices = raw_response.get("choices", [])
    if not choices:
        raise ValueError("LLM API returned no choices.")

    message = choices[0].get("message", {})
    content = message.get("content", "")
    if isinstance(content, list):
        text = "".join(item.get("text", "") for item in content if isinstance(item, dict))
    else:
        text = str(content)

    return normalize_query_plan(extract_json_object(text))


def normalize_query_plan(raw_plan: dict[str, object]) -> dict[str, object]:
    sql = str(raw_plan.get("sql", "")).strip()
    if not sql:
        raise ValueError("LLM response did not include SQL.")

    chart_type = str(raw_plan.get("chart_type", "table")).strip().lower()
    if chart_type not in {"metric", "bar", "line", "table"}:
        chart_type = "table"

    x_field = raw_plan.get("x_field")
    x_field = str(x_field).strip() if x_field else None

    y_fields_raw = raw_plan.get("y_fields")
    if isinstance(y_fields_raw, list):
        y_fields = [str(field).strip() for field in y_fields_raw if str(field).strip()]
    else:
        y_field = raw_plan.get("y_field")
        y_fields = [str(y_field).strip()] if y_field else []

    title = raw_plan.get("title")
    explanation = raw_plan.get("explanation")

    return {
        "sql": sql,
        "chart_type": chart_type,
        "x_field": x_field,
        "y_fields": y_fields,
        "title": str(title).strip() if title else None,
        "explanation": str(explanation).strip() if explanation else None,
        "translation_source": "llm",
    }


def _post_json(url: str, headers: dict[str, str], payload: dict[str, object]) -> dict[str, object]:
    request = Request(
        url=url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST",
    )

    try:
        with urlopen(request, timeout=45) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as error:
        body = error.read().decode("utf-8", errors="ignore")
        raise ValueError(f"LLM API request failed with HTTP {error.code}: {body}") from error
    except URLError as error:
        raise ValueError(f"LLM API request failed: {error.reason}") from error
