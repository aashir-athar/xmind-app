# User Profile Navigation

## Overview
This feature allows users to navigate to other users' profiles by clicking on their name or profile picture in post cards.

## Implementation Details

### 1. User Profile Screen (`/app/user-profile.tsx`)
- **Location**: `Mobile/app/user-profile.tsx`
- **Purpose**: Displays another user's profile with follow/unfollow functionality
- **Design**: Mirrors the main Profile.tsx design with a follow button instead of edit button
- **Navigation**: Stack navigation from the main app layout

### 2. Navigation Setup
- **Root Layout**: Added `user-profile` screen to the main Stack navigator
- **Route**: `/user-profile` with parameters `userId` and `username`
- **Back Navigation**: Includes a back button to return to the previous screen

### 3. PostCard Integration
- **Clickable Elements**: 
  - User profile picture (avatar)
  - User's full name
  - Username (@username)
- **Navigation**: All clickable elements navigate to the user profile screen
- **Parameters Passed**: `userId` and `username` for the target user

### 4. Features
- **Follow/Unfollow Button**: Toggle button with different states
- **Profile Display**: Shows user info, stats, and posts
- **Posts List**: Displays the user's posts using the existing PostsList component
- **Responsive Design**: Matches the main profile screen's design and animations

### 5. Future Enhancements
- **API Integration**: Replace mock data with actual user data fetching
- **Follow Functionality**: Implement actual follow/unfollow API calls
- **Real-time Updates**: Update follower counts and follow status
- **User Verification**: Display verification badges if available
- **Location & Bio**: Show actual user location and bio information

## Usage
1. Navigate to any post in the feed
2. Click on the user's profile picture, name, or username
3. You'll be taken to their profile screen
4. Use the back button to return to the previous screen
5. Use the follow/unfollow button to follow/unfollow the user

## Technical Notes
- Uses Expo Router for navigation
- Implements the same animation system as Profile.tsx
- Follows the existing design system and color scheme
- Integrates with existing hooks (usePosts, etc.)
- Maintains consistent styling with the rest of the app
