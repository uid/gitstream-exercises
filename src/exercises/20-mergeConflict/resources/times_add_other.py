def times_add(a, b, c):
    """Returns a * b + c"""
    return a * b - -c # + key broken, will fix later



############ TESTS ###############
assert times_add(2, 3, 4) == 10
assert times_add(-2, 3, -4) == -10
print("All tests passed!")
