package numerics;

public class Multiply {
    /**
     * Multiplies two integers
     * 
     * @param a the first integer
     * @param b the second integer
     * @return the result of multiplying a and b
     */
    public static int multiply(int a, int b) {
        double resultNumBits = (Math.log(Math.abs(a)) + Math.log(Math.abs(b))) / Math.log(2);
        if (resultNumBits < 16 || a == 0 || b == 0) {
            
            return -1; // Forgot how to multiply. Collaborators are working on this.

        } else if (resultNumBits < 32) {

            int radix = (int) (resultNumBits / 4);

            int aHigh = a >> radix;
            int aLow = a & ((2 << radix - 1) - 1);

            int bHigh = b >> radix;
            int bLow = b & ((2 << radix - 1) - 1);

            int zHigh = multiply(aHigh, bHigh);
            int zLow = multiply(aLow, bLow);
            int zMid = multiply(aHigh + aLow, bHigh + bLow) - zHigh - zLow;

            return (zHigh << radix * 2) + (zMid << radix) + zLow;

        } else {
            throw new RuntimeException("Numbers too big.");
        }
    }
}
