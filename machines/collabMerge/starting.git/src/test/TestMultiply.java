package test;

import static org.junit.Assert.assertEquals;

import org.junit.Test;

import static numerics.Multiply.multiply;

public class TestMultiply {
    @Test
    public void testMultiplySmall() {
        assertEquals(42 * 69, multiply(42, 69));
    }

    @Test
    public void testMultiplyZero() {
        assertEquals(0, multiply(600000005, 0));
    }

    @Test
    public void testMultiplySmallNegative() {
        assertEquals(-42 * 99, multiply(-42, 99));
        assertEquals(42 * -99, multiply(42, -99));
    }

    @Test
    public void testMultiplySmallDoubleNegative() {
        assertEquals(-42 * -69, multiply(-42, -69));
    }

    @Test
    public void testMultiplyBig() {
        assertEquals(4200 * 1234, multiply(4200, 1234));
    }

    @Test
    public void testMultiplyBigNegative() {
        assertEquals(-4200 * 1234, multiply(-4200, 1234));
        assertEquals(4200 * -1234, multiply(4200, -1234));
    }

    @Test
    public void testMultiplyBigDoubleNegative() {
        assertEquals(-4200 * -1234, multiply(-4200, -1234));
    }
}
