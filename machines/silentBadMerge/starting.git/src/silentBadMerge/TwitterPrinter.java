package silentBadMerge;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class TwitterPrinter {
    
    private static Map<String, List<Tweet>> tweetsByAuthor;
    
    /**
     * Prints the usernames of people who tweeted at the same time.
     *  Printout takes the format "person1 person2"
     * @param tweetsByAuthor
     * @param time
     */
    public static void printTweetersAt(Map<String, List<Tweet>> tweetsByAuthor, Instant time) {
        throw new RuntimeException("Not implemented");
    }
    
    
    
    public static void main(String[] args) {
        tweetsByAuthor = new HashMap<String, List<Tweet>>();
        
        Instant now = Instant.now();
        Instant fiveMinsAgo = now.minusSeconds(60 * 5);
        Instant fortyTwoSecondsAgo = now.minusSeconds(42);
        Instant yesterday = now.minusSeconds(60 * 60 * 24);
        Instant inABit = now.plusSeconds(4242);
        
        List<Tweet> tweetsByNick = new ArrayList<Tweet>();
        tweetsByNick.add(new Tweet(1, "nhynes", "I don't even use twitter...", fiveMinsAgo));
        tweetsByNick.add(new Tweet(42, "nhynes", "I am a leaf on the wind. Watch how I soar.", now));
        tweetsByNick.add(new Tweet(2, "nhynes", "@maxg Writing sample code for 6.005 is hard", fortyTwoSecondsAgo));
        
        List<Tweet> tweetsByMax = new ArrayList<Tweet>();
        tweetsByMax.add(new Tweet(5, "maxg", "Muahahahaha!!", inABit));
        tweetsByMax.add(new Tweet(3, "maxg", "I am Max, God-King of 6.005", yesterday));
        tweetsByMax.add(new Tweet(4, "maxg", "I say: \"Let there be psets\" (and there were psets)", fortyTwoSecondsAgo));
        
        List<Tweet> tweetsByYou = new ArrayList<Tweet>();
        tweetsByYou.add(new Tweet(8, "you", "@maxg Arghh! Noo!", inABit));
        tweetsByYou.add(new Tweet(7, "you", "Well, at least it's not Awesome Document Time...", inABit.minusSeconds(1)));  
        tweetsByYou.add(new Tweet(6, "you", "Hello, from the future!", Instant.now()));
        
        tweetsByAuthor.put("nhynes", tweetsByNick);
        tweetsByAuthor.put("maxg", tweetsByMax);
        tweetsByAuthor.put("you", tweetsByYou);
        
        System.out.println("Authors tweeting five minutes ago:");
        printTweetersAt(tweetsByAuthor, fiveMinsAgo);
        
        System.out.println("\nAuthors tweeting fortyTwoSeconds ago:");
        printTweetersAt(tweetsByAuthor, fortyTwoSecondsAgo);

        System.out.println("\nAuthors tweeting in a bit:");
        printTweetersAt(tweetsByAuthor, inABit);
    }

}
