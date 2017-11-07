import filecmp
import os
i = 1946
j = 1947
while (j < 2017):
    fi = "cntry%d.json" % i
    fj = "cntry%d.json" % j
    if (filecmp.cmp(fi, fj)):
        print("%d %d" % (i, j))
        os.remove(fj)
    else:
        i = j
    j += 1

