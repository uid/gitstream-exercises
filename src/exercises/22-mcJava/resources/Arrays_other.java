package lib;

public class Arrays {

    /**
     * Returns the index of the largest element in an array.
     * @param input A nonempty array of unique elements.
     */
    public static int argmax(int[] input) {
        int i = input.length - 1;
        int currentMaximum = input[i];
        int currentArgmax = i;
        i--;
        while (i >= 0) {
            if (input[i] > currentMaximum) {
                currentMaximum = input[i];
                currentArgmax = i;
            }
        }
        return currentArgmax;
    }
}
