package numerics;

public class Multiply {
    /**
     * Multiplies two integers
     * 
     * @param a
     *            the first integer
     * @param b
     *            the second integer
     * @return the result of multiplying a and b
     */
    public static int multiply(int a, int b) {
        double resultNumBits = Math.round((Math.log(a) + Math.log(b)) / Math.log(2));
        if (resultNumBits < 16 || a == 0 || b == 0) {
            return -1; // FIXME: I forgot how to multiply numbers in Java!
        } else if (resultNumBits < 32) {
            int maxNum = Math.max(a, b);
            int maxBits = (int) (Math.log(maxNum) / Math.log(2));
            maxBits = (int) (Math.ceil(maxBits / 8.0) * 8); // nearest byte

            int aHigh = a >> (maxBits / 2);
            int aLow = a & ((2 << (maxBits / 2)) - 1);

            int bHigh = b >> (maxBits / 2);
            int bLow = b & ((2 << (maxBits / 2)) - 1);

            int zHigh = multiply(aHigh, bHigh);
            int zLow = multiply(aLow, bLow);
            int zMid = multiply(aHigh + aLow, bHigh + bLow) - zHigh - zLow;

            return (zHigh << maxBits) + (zMid << (maxBits / 2)) + zLow;
        } else {
            throw new RuntimeException("Numbers too big.");
        }
    }
}
