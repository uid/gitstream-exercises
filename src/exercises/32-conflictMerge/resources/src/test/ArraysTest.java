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
}
