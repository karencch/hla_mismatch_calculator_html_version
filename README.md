# hla_mismatch_calculator_html_version

A LITTLE BACKGROUND:
This is a small program to calculate HLA mismatches between blood and marrow transplant donors and recipients.
I wrote this program to automate the manual task of doing this for my current job. As such, it runs locally as it was for personal use.

This program might be a bit esoteric and little bit of a niche area, but here is a general primer on HLA matching:
There is high and low resolution testing for genetic matches between transplant donors and recipients. They are analyzed for a match at up to 6 locations, i.e., 6 different HLA gene loci. Depending on if there is a match at an antigen or allelic level, we calculate the number of mismatches at each locus per the following guidelines:

Report one result (0, 1, 2) per locus (antigenic or allelic); the other level is ND.
ND is used for the level not being reported.
Report mismatches at each loci using the level (antigenic or allelic) where matching is determined.
If the first two digits don’t match, report the mismatch at the antigen level and report the allelic level as ND.
If the first two digits match, report the mismatch at the allelic level (if determined) and report the antigen level as ND.
An allele string or code (ex. PAYK) makes it impossible to match at the allele level. Enter ND for the result at the allele level and report the match/mismatch at the antigen level.
X means that no other allele was found, i.e. not detected or homozygous (the same). We assume that the subject in question is homozygous; because we cannot prove the homozygosity the second allele it is reported as X.
NOTE: DPB1 mismatch alone is still considered "identical" (only count A/B/C/DRB1/DQB1).
So long as A/B/C/DRB1/DQB1 are the same between donor and recipient, this would be a full match even if DPB1 is different (10/10).

HOW THE PROGRAM IS MADE:
HTML, CSS, Javascript

INSTRUCTIONS:
Open the index.html file in your browser. Enter in the HLA antigens as directed to calculate the number of mismatches. This project was intended to run locally.

LESSONS LEARNED:
I tried to implement as much of a functional programming style as I could. My goal was to make this project as modular as possible so that, in the future, I could add the ability to analyze multiple gene loci at once; currently, the program only analyzes one gene locus at a time. For my job, we usually have to analzye six gene loci for mismatches/matches.

AREAS FOR IMPROVEMENT:
There is a lot of repetition in the code; in future iterations, I would like to reduce the repetition.
