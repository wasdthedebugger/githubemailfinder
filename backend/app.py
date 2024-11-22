import os
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)

# Allow CORS for all origins
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,POST')
    return response

# Function to fetch GitHub email
def get_github_email(username, token=None):
    base_url = "https://api.github.com"
    headers = {}
    if token:
        headers["Authorization"] = f"token {token}"
    
    # Fetch user repositories
    repos_url = f"{base_url}/users/{username}/repos"
    repos_response = requests.get(repos_url, headers=headers)
    
    if repos_response.status_code != 200:
        return {
            "error": "Failed to fetch repositories",
            "details": repos_response.json(),
        }, 400
    
    repos = repos_response.json()
    if not repos:
        return {"error": "No repositories found for the user."}, 404
    
    # Prioritize the profile repository (usually named the same as the user)
    profile_repo = None
    other_repos = []
    
    for repo in repos:
        if repo['name'] == username:  # Profile repo usually matches username
            profile_repo = repo
        else:
            other_repos.append(repo)
    
    # Start by checking the profile repo first
    repos_to_check = [profile_repo] + other_repos if profile_repo else other_repos
    
    found_email = None
    no_reply_emails = []

    for repo in repos_to_check:
        repo_name = repo["name"]
        commits_url = f"{base_url}/repos/{username}/{repo_name}/commits"
        commits_response = requests.get(commits_url, headers=headers)
        
        if commits_response.status_code != 200:
            continue
        
        commits = commits_response.json()
        if not commits:
            continue
        
        # Check commits for email
        for commit in commits:
            commit_data = commit.get("commit", {})
            author_data = commit_data.get("author", {})
            committer_data = commit_data.get("committer", {})
            
            # Fetch emails from commits authored or committed by the username
            emails = [
                author_data.get("email"),
                committer_data.get("email"),
            ]
            
            for email in emails:
                if email:
                    if "noreply.github.com" in email:
                        no_reply_emails.append(email)
                    else:
                        found_email = email
                        return {
                            "email": found_email,
                            "no_reply_emails": no_reply_emails,
                        }
    
    # Return results if no valid email found
    return {
        "email": None,
        "no_reply_emails": no_reply_emails,
    }

# Flask route for POST method
@app.route('/get_github_email', methods=['POST'])
def fetch_github_email():
    data = request.json
    if not data or 'username' not in data:
        return jsonify({"error": "Missing required field 'username'"}), 400
    
    username = data["username"]
    token = data.get("token")  # Optional GitHub token
    result = get_github_email(username, token)
    return jsonify(result)

# Flask route for GET method
@app.route('/username/<username>', methods=['GET'])
def get_email_by_username(username):
    token = "YOUR_TOKEN"  # Optional GitHub token
    result = get_github_email(username, token)
    return jsonify(result)

@app.route('/username', methods=['GET'])
def say_send_username():
    return "Send a username to fetch email!"

if __name__ == "__main__":
    app.run(debug=True)

