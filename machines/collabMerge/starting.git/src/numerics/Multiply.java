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
            
            throw new RuntimeException("Not implemented");

        } else if (resultNumBits < 32) {

            throw new RuntimeException("Not implemented");

        } else {
            throw new RuntimeException("Numbers too big.");
        }
    }
}
