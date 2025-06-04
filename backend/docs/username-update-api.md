# Username Update API

This document describes the secure route for updating usernames with proper authentication and authorization.

## Endpoint

```
PUT /api/v1/update-username/:userId
```

## Security Measures

1. **Authentication**
   - Uses Passport.js with JWT strategy
   - Verifies JWT token from the Authorization header

2. **Authorization**
   - Ensures authenticated users can only update their own username
   - Prevents users from modifying other users' usernames

3. **Input Validation**
   - Validates username format (alphanumeric plus underscore, 3-20 characters)
   - Checks for username availability to prevent duplicates

## Request

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Parameters
- `userId` (path parameter): ID of the user whose username is being updated

### Body
```json
{
  "username": "new_username"
}
```

## Response

### Success (200 OK)
```json
{
  "message": "Username updated successfully",
  "user": {
    "id": 1,
    "username": "new_username",
    "name": "User Name",
    "email": "user@example.com"
  }
}
```

### Errors

#### 400 Bad Request
- Missing username
- Invalid username format

```json
{
  "error": "Invalid username format. Username must be 3-20 characters and contain only letters, numbers, and underscores."
}
```

#### 401 Unauthorized
- Missing or invalid JWT token

```json
{
  "error": "Authentication required"
}
```

#### 403 Forbidden
- User trying to update someone else's username

```json
{
  "error": "Unauthorized: You can only access or modify your own resources"
}
```

#### 404 Not Found
- User ID doesn't exist

```json
{
  "error": "User not found"
}
```

#### 409 Conflict
- Username already taken

```json
{
  "error": "Username already taken"
}
```

## Example Usage

```javascript
// Update username
const updateUsername = async (userId, newUsername, token) => {
  try {
    const response = await fetch(`http://localhost:6000/api/v1/update-username/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: newUsername })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update username');
    }
    
    return data;
  } catch (error) {
    console.error('Error updating username:', error);
    throw error;
  }
};
``` 