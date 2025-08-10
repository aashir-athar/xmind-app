export type MessageType = {
  id: number;
  text: string;
  fromUser: boolean; // true if message is from current user, false if from other user
  timestamp: Date;
  time: string;
};

export type ConversationType = {
  id: number;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  lastMessage: string;
  time: string;
  timestamp: Date;
  messages: MessageType[];
};

export const CONVERSATIONS: ConversationType[] = [
  {
    id: 1,
    user: {
      name: "James Doe",
      username: "jamesdoe",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      verified: false,
    },
    lastMessage: "Thanks for sharing that article! Really helpful insights.",
    time: "2h",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    messages: [
      {
        id: 1,
        text: "Hey! Did you see that new article about React Native performance?",
        fromUser: false,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        time: "4h",
      },
      {
        id: 2,
        text: "No, I haven't! Could you share the link?",
        fromUser: true,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        time: "4h",
      },
      {
        id: 3,
        text: "Thanks for sharing that article! Really helpful insights.",
        fromUser: true,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        time: "2h",
      },
    ],
  },
  {
    id: 2,
    user: {
      name: "Coffee Lover",
      username: "coffeelover",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      verified: false,
    },
    lastMessage:
      "See you at the meetup tomorrow! Don't forget to bring your laptop.",
    time: "2d",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    messages: [
      {
        id: 1,
        text: "Are you planning to attend the React meetup this weekend?",
        fromUser: false,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        time: "3d",
      },
      {
        id: 2,
        text: "Yes! I've been looking forward to it. Should be great networking.",
        fromUser: true,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        time: "3d",
      },
      {
        id: 3,
        text: "See you at the meetup tomorrow! Don't forget to bring your laptop.",
        fromUser: false,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        time: "2d",
      },
    ],
  },
  {
    id: 3,
    user: {
      name: "Alex Johnson",
      username: "alexj",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
      verified: false,
    },
    lastMessage: "Great collaboration on the project. The demo was impressive!",
    time: "3d",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    messages: [
      {
        id: 1,
        text: "How's the progress on the mobile app project?",
        fromUser: false,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        time: "4d",
      },
      {
        id: 2,
        text: "Going really well! Just finished the authentication flow. Want to see a demo?",
        fromUser: true,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        time: "4d",
      },
      {
        id: 3,
        text: "Great collaboration on the project. The demo was impressive!",
        fromUser: false,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        time: "3d",
      },
    ],
  },
  {
    id: 4,
    user: {
      name: "Design Studio",
      username: "designstudio",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      verified: true,
    },
    lastMessage:
      "The new designs look fantastic. When can we schedule a review?",
    time: "1w",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    messages: [
      {
        id: 1,
        text: "We've finished the initial mockups for your app. They're ready for review!",
        fromUser: false,
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        time: "1w",
      },
      {
        id: 2,
        text: "Awesome! Can't wait to see them. The timeline works perfectly.",
        fromUser: true,
        timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
        time: "1w",
      },
      {
        id: 3,
        text: "The new designs look fantastic. When can we schedule a review?",
        fromUser: false,
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        time: "1w",
      },
    ],
  },
  {
    id: 5,
    user: {
      name: "Sarah Kim",
      username: "sarahk",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      verified: true,
    },
    lastMessage:
      "Thanks for the book recommendation — halfway through already!",
    time: "5h",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    messages: [
      {
        id: 1,
        text: "Hey, have you read ‘Atomic Habits’ yet?",
        fromUser: false,
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
        time: "7h",
      },
      {
        id: 2,
        text: "Not yet, but I’ll order it now.",
        fromUser: true,
        timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000),
        time: "7h",
      },
      {
        id: 3,
        text: "Thanks for the book recommendation — halfway through already!",
        fromUser: true,
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        time: "5h",
      },
    ],
  },
  {
    id: 6,
    user: {
      name: "Tech Weekly",
      username: "techweekly",
      avatar:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=100&h=100&fit=crop&crop=face",
      verified: false,
    },
    lastMessage: "Loved that piece on AI ethics. Very thought-provoking.",
    time: "1d",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    messages: [
      {
        id: 1,
        text: "Here's the link to the AI ethics article: https://www.brookings.edu/articles/ai-ethics/",
        fromUser: false,
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        time: "2d",
      },
      {
        id: 2,
        text: "Just finished reading it. Loved that piece on AI ethics. Very thought-provoking.",
        fromUser: true,
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        time: "1d",
      },
    ],
  },
  {
    id: 7,
    user: {
      name: "Michael Lee",
      username: "mlee",
      avatar:
        "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100&h=100&fit=crop&crop=face",
      verified: false,
    },
    lastMessage: "Let’s do a video call tomorrow to finalize the pitch.",
    time: "6h",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    messages: [
      {
        id: 1,
        text: "The investor deck is ready. Can you review it?",
        fromUser: false,
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000),
        time: "9h",
      },
      {
        id: 2,
        text: "Yes, I'll check it out tonight.",
        fromUser: true,
        timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000),
        time: "9h",
      },
      {
        id: 3,
        text: "Let’s do a video call tomorrow to finalize the pitch.",
        fromUser: false,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        time: "6h",
      },
    ],
  },
  {
    id: 8,
    user: {
      name: "Ella Rogers",
      username: "ellar",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop&crop=face",
      verified: true,
    },
    lastMessage: "The recipe turned out amazing — my family loved it!",
    time: "12h",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    messages: [
      {
        id: 1,
        text: "I found this pasta recipe for you: https://www.bbcgoodfood.com/recipes/ultimate-spaghetti-carbonara-recipe",
        fromUser: false,
        timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000),
        time: "15h",
      },
      {
        id: 2,
        text: "The recipe turned out amazing — my family loved it!",
        fromUser: true,
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        time: "12h",
      },
    ],
  },
  {
    id: 9,
    user: {
      name: "Startup Hub",
      username: "startuphub",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
      verified: false,
    },
    lastMessage: "Registered for the event. See you there!",
    time: "3d",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    messages: [
      {
        id: 1,
        text: "Don’t forget to sign up for the startup networking night: https://www.eventbrite.com/",
        fromUser: false,
        timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        time: "4d",
      },
      {
        id: 2,
        text: "Registered for the event. See you there!",
        fromUser: true,
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        time: "3d",
      },
    ],
  },
  {
    id: 10,
    user: {
      name: "Daniel Smith",
      username: "dsmith",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face",
      verified: false,
    },
    lastMessage: "Yes, let's schedule the podcast recording for Friday.",
    time: "8h",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    messages: [
      {
        id: 1,
        text: "Are you free for the podcast recording this week?",
        fromUser: false,
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
        time: "10h",
      },
      {
        id: 2,
        text: "Yes, let's schedule the podcast recording for Friday.",
        fromUser: true,
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
        time: "8h",
      },
    ],
  },
  {
    id: 11,
    user: {
      name: "Olivia Tran",
      username: "oliviat",
      avatar:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=100&h=100&fit=crop&crop=face",
      verified: false,
    },
    lastMessage: "That TED Talk was inspiring, thanks for sharing!",
    time: "20h",
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
    messages: [
      {
        id: 1,
        text: "Check out this TED Talk on creativity: https://www.ted.com/talks/elizabeth_gilbert_on_genius",
        fromUser: false,
        timestamp: new Date(Date.now() - 22 * 60 * 60 * 1000),
        time: "22h",
      },
      {
        id: 2,
        text: "That TED Talk was inspiring, thanks for sharing!",
        fromUser: true,
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000),
        time: "20h",
      },
    ],
  },
];
