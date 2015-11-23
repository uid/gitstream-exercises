import static org.junit.Assert.assertEquals;

import org.junit.Test;

public class ArrayUtilTest {
    @Test
    public void testArgMaxPositive() {
        int[] a = {1, 3, 2, 6, 7, 4};
        assertEquals(4, ArrayUtil.argmax(a));
    }

    @Test
    public void testArgMaxSingleton() {
        int[] a = {0};
        assertEquals(0, ArrayUtil.argmax(a));
    }

    @Test
    public void testArgMaxNegative() {
        int[] a = {-3, -2, -4, -1};
        assertEquals(3, ArrayUtil.argmax(a));
    }
}
