confusion = {}
confusion[1] = 1
confusion['1'] = 2
confusion[1] += 1
sum = 0
for k in confusion:
    sum += confusion[k]
print sum