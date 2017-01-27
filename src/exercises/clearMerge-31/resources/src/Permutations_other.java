public class Permutations {
    public static void main(String[] args) {
        printPermutations("abcd");
    }

    /**
     * Prints all permutations of the input string to System.out.
     * @param s a sequence of characters with no repeats
     */
    public static void printPermutations(String s) {
        // implement this function by calling printPermutationsHelper(..)
        //   with the empty String tail
        // your imaginary collaborator will implement the helper function,
        //   so don't edit it!

        printPermutationsHelper(/* your code here */);
    }

    /**
     * Recursive helper function for printPermutations.
     * Example: printPermutations("ab", "123") will print "ab123" and "ba123"
     * @param s the string for which all permutations will be printed
     * @param tail a string that will be appended to every permutation of s
     */
    private static void printPermutationsHelper(String s, String tail) {
        if (s.length() == 0) {
            System.out.println(tail);
        }
        for (int i = 0; i < s.length(); i++) {
            printPermutationsHelper(s.substring(0, i) + s.substring(i + 1, s.length()), s.charAt(i) + tail);
        }
    }
}
