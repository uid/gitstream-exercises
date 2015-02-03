def is_code_good(safe_from_bugs, ready_for_change, easy_to_understand):
    """
    Determines whether a piece of software meets 6.005 standards.
    Software meets 6.005 standards if it is safe from bugs, ready for change, and easy to understand.
    """
    pass # your code here!



############ TESTS ###############
for sfb in (True, False):
    for rfc in (True, False):
        for etu in (True, False):
            assert is_code_good(sfb, rfc, etu) == (sfb and rfc and etu)
print("All tests passed!")
