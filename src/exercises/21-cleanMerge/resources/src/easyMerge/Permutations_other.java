package easyMerge;

public class Permutations {
    public static void main(String[] args) {
        printPermutations("abcd");
    }

    /**
     * Prints all permutations of the input string to System.out.
     * @param s a sequence of characters with no repeats
     */
    public static void printPermutations(String s) {
        // implement this using a call to the two-argument printPermutations
        // your collaborator will write that later

        printPermutations(/* your code here */);
    }

    /**
     * Private helper method for printPermutations.
     * Example: printPermutations("ab", "123") will print "ab123" and "ba123"
     * @param s The string for which all permutations will be printed
     * @param tail A string that will be appended to every permutation of s
     */
    private static void printPermutations(String s, String tail) {
        if (s.length() == 0) {
            System.out.println(tail);
        }
        for (int i = 0; i < s.length(); i++) {
            printPermutations(s.substring(0, i) + s.substring(i + 1, s.length()), s.charAt(i) + tail);
        }
    }
}
