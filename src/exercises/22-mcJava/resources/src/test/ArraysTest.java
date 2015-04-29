package test;

import static org.junit.Assert.assertEquals;
import lib.Arrays;

import org.junit.Test;

public class ArraysTest {
    @Test
    public void testArgMax() {
        int[] a = {1, 3, 2, 6, 7, 4};
        assertEquals(4, Arrays.argmax(a));
    }

    @Test
    public void testArgMaxSingleton() {
        int[] a = {0};
        assertEquals(0, Arrays.argmax(a));
    }

    @Test
    public void testArgMaxNegative() {
        int[] a = {-3, -2, -4, -1};
        assertEquals(3, Arrays.argmax(a));
    }
}
