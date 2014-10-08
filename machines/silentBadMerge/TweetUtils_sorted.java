package silentBadMerge;

import java.time.Instant;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class TweetUtils {

    private static final Comparator<Tweet> timestampComparator = new Comparator<Tweet>() {
        @Override
        public int compare(Tweet o1, Tweet o2) {
            if(o1 == o2 || o1.equals(o2)) {
                return 0;
            } else {
                if(o1.getTimestamp().equals(o2.getTimestamp())) {
                    return 0;
                } else {
                    return o1.getTimestamp().compareTo(o2.getTimestamp());
                }
            }
        }
    };

    /**
     * Find a tweet at the specified instant.
     * @param tweets the list of tweets to search. Must be sorted.
     * @param time the timestamp for which to search
     * @throws TweetNotFoundException if the tweet is not found
     * @return a tweet occuring at the specified instant
     */
    public static Tweet findTweetAt(List<Tweet> tweets, Instant time) throws TweetNotFoundException {
        Tweet testTweet = new Tweet(Integer.MIN_VALUE, null, null, time);
        int foundIndex = Collections.binarySearch(tweets, testTweet, timestampComparator);
        if(foundIndex >= 0) {
            return tweets.get(foundIndex);
        } else {
            throw new TweetNotFoundException();
        }
    }

    /**
     * Sorts a list of tweets, in-place, by timestamp.
     * @param tweets the tweets to sort by timestamp
     */
    public static void sortTweetsByTimestamp(List<Tweet> tweets) {
        Collections.sort(tweets, timestampComparator);
    }

    public static class TweetNotFoundException extends Exception {
        private static final long serialVersionUID = 1L;
    }
}
