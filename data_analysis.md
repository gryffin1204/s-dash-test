# Loan Data Analysis

## Overview
The dataset consists of two pipe-delimited (`|`) files containing 2020 loan data. The format aligns with the Freddie Mac Single-Family Loan-Level Dataset.

## File Summary
| File | Size | Lines | Description |
| :--- | :--- | :--- | :--- |
| [sample_orig_2020.txt](file:///c:/Users/vaibh/Downloads/sample_2020/sample_orig_2020.txt) | 7.24 MB | 50,001 | Origination data (loan characteristics at the time of purchase). |
| [sample_svcg_2020.txt](file:///c:/Users/vaibh/Downloads/sample_2020/sample_svcg_2020.txt) | 192.14 MB | 2,340,587 | Servicing data (monthly performance history). |

## [sample_orig_2020.txt](file:///c:/Users/vaibh/Downloads/sample_2020/sample_orig_2020.txt) Field List (32 Fields)
1. **Credit Score**: Borrower's credit score at origination.
2. **First Payment Date**: Year and Month (YYYYMM).
3. **First Time Homebuyer Flag**: Y, N, or 9 (Unknown).
4. **Maturity Date**: Year and Month (YYYYMM).
5. **MSA Or Metropolitan Division**: Metropolitan Statistical Area.
6. **MI %**: Mortgage Insurance percentage.
7. **Number of Units**: 1 to 4.
8. **Occupancy Status**: P (Primary Residence), S (Second Home), I (Investment Property), 9 (Unknown).
9. **Original CLTV**: Combined Loan-to-Value.
10. **Original DTI**: Debt-to-Income ratio.
11. **Original Principal Balance**: In USD.
12. **Original LTV**: Loan-to-Value.
13. **Original Interest Rate**: Percentage.
14. **Channel**: R (Retail), B (Broker), C (Correspondent), T (T-Channel), 9 (Unknown).
15. **PPM Flag**: Prepayment Penalty Mortgage flag (Y/N).
16. **Amortization Type**: e.g., FRM (Fixed Rate Mortgage).
17. **Property State**: Two-letter state code.
18. **Property Type**: SF (Single Family), CO (Condo), PU (PUD), MH (Manufactured Housing), CP (Co-op).
19. **Postal Code**: First 5 digits.
20. **Loan Sequence Number**: Unique identifier (e.g., F20Q1...).
21. **Loan Purpose**: P (Purchase), C (Refinance - Cash Out), N (Refinance - No Cash Out), R (Refinance - Not Specified).
22. **Original Loan Term**: Number of months.
23. **Number of Borrowers**: Number of persons responsible for the loan.
24. **Seller Name**: Name of the entity that sold the loan to Freddie Mac.
25. **Servicer Name**: Name of the entity servicing the loan.
26. **Super Conforming Flag**: Flag for loans above standard conforming limits.
27. **Pre-HARP Loan Sequence Number**: For HARP loans.
28. **Program Indicator**: H (Home Possible), F (HFA Advantage), 9 (Not Applicable).
29. **HARP Indicator**: Y (HARP Loan).
30. **Property Valuation Method**: Model/Method used for valuation.
31. **I/O Indicator**: Interest Only flag.
32. **MI Cancellation Indicator**: Indicates if MI was cancelled.

## [sample_svcg_2020.txt](file:///c:/Users/vaibh/Downloads/sample_2020/sample_svcg_2020.txt) Field List (32 Fields)
1. **Loan Sequence Number**: Foreign Key to Origination file.
2. **Monthly Reporting Period**: Year and Month (YYYYMM).
3. **Current Actual UPB**: Unpaid Principal Balance for the period.
4. **Current Loan Delinquency Status**: 0 (Current), numbers indicate months delinquent.
5. **Loan Age**: Months since origination.
6. **Remaining Months to Maturity**: Months remaining.
7. **Defect Settlement Date**: For repurchased loans.
8. **Modification Flag**: Y (Loan was modified).
9. **Zero Balance Code**: Indicates reason for termination (e.g., 01=Prepaid, 03=Foreclosure).
10. **Zero Balance Effective Date**: Date of termination.
11. **Current Interest Rate**: Interest rate for the month.
12. **Current Deferred UPB**: Principal amount deferred.
13. **Due Date of Last Paid Installment**: Used for non-performing loans.
14. **MI Recoveries**: Mortgage Insurance recoveries.
15. **Net Sales Proceeds**: From property sale.
16. **Non MI Recoveries**: Other recoveries.
17. **Expenses**: Total expenses incurred.
18. **Legal Costs**: Foreclosure/legal costs.
19. **Maintenance/Preservation Costs**: Cost to maintain property.
20. **Taxes and Insurance**: Paid during servicing.
21. **Miscellaneous Expenses**: Other costs.
22. **Actual Loss Calculation**: Calculated loss on the loan.
23. **Modification Cost**: Cost associated with loan modification.
24. **Step Modification Flag**: Indicates if it was a step-rate modification.
25. **Deferred Payment Plan**: Flag for deferred payment arrangements.
26. **Estimated Property Value**: Current estimate.
27. **Zero Balance Removal UPB**: UPB at the time of removal.
28. **Delinquent Accrued Interest**: Interest accrued during delinquency.
29. **Disaster Indicator**: Flag if property is in a disaster area.
30. **Borrower Assistance Status**: Codes for forbearance, etc.
31. **Current Month Modification Cost**: Incurred this month.
32. **Interest Bearing UPB**: Portion of UPB that is interest-bearing.

---
> [!NOTE]
> The [sample_svcg_2020.txt](file:///c:/Users/vaibh/Downloads/sample_2020/sample_svcg_2020.txt) file is much larger because it contains multiple monthly records for each loan identified in the origination file.
