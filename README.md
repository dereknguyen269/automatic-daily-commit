# Automatic Daily Commit

Automatically commit and push changes to your GitHub repository on a daily schedule using GitHub Actions.

## 🚀 Features

- **Automated Daily Commits**: Runs every day at midnight UTC
- **Smart Detection**: Only commits when there are actual changes
- **Manual Trigger**: Can be triggered manually from GitHub Actions tab
- **Timestamped Logs**: Maintains a daily log with timestamps
- **Zero Configuration**: Works out of the box with GitHub's built-in authentication

## 📋 How It Works

The workflow uses GitHub Actions to:

1. **Schedule**: Runs daily at 00:00 UTC (customizable)
2. **Check**: Scans the repository for any changes
3. **Update**: Appends a timestamp to `daily-log.txt`
4. **Commit**: Creates a commit if changes are detected
5. **Push**: Automatically pushes to the main branch

## 🛠️ Setup Instructions

### 1. Clone or Create Repository

```bash
git clone <your-repo-url>
cd automatic-daily-commit
```

### 2. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 3. Enable Actions

- Go to your repository on GitHub
- Navigate to the **Actions** tab
- The workflow will appear automatically
- It will run on the scheduled time or can be triggered manually

## ⚙️ Customization

### Change Schedule

Edit `.github/workflows/daily-commit.yml` and modify the cron expression:

```yaml
schedule:
  - cron: '0 0 * * *'  # Daily at midnight UTC
```

**Common schedules:**
- `'0 0 * * *'` - Daily at midnight UTC
- `'0 12 * * *'` - Daily at noon UTC
- `'0 */6 * * *'` - Every 6 hours
- `'0 0 * * 1'` - Every Monday at midnight
- `'0 9 * * 1-5'` - Weekdays at 9 AM UTC

Use [crontab.guru](https://crontab.guru/) to create custom schedules.

### Change Commit Message

Modify the commit message in the workflow file:

```yaml
git commit -m "chore: daily auto-commit $(date '+%Y-%m-%d')"
```

### Change What Gets Updated

Edit the "Update daily log" step to modify what changes are made:

```yaml
- name: Update daily log
  run: |
    echo "Your custom content" >> your-file.txt
```

### Adjust Timezone

The workflow runs on UTC time. To adjust for your timezone:

- **UTC+7 (Bangkok)**: Use `'0 17 * * *'` for midnight local time
- **UTC-5 (EST)**: Use `'0 5 * * *'` for midnight local time
- **UTC+0 (London)**: Use `'0 0 * * *'` for midnight local time

## 🔧 Manual Trigger

To manually run the workflow:

1. Go to **Actions** tab in your GitHub repository
2. Select **Daily Auto Commit** workflow
3. Click **Run workflow** button
4. Choose the branch and click **Run workflow**

## 📝 Files

- `.github/workflows/daily-commit.yml` - GitHub Actions workflow configuration
- `daily-log.txt` - Sample file that gets updated daily
- `README.md` - This documentation file

## 🔍 Troubleshooting

### Workflow not running?

- Check that Actions are enabled in repository settings
- Verify the cron schedule is correct
- Ensure the repository has write permissions

### No commits appearing?

- The workflow only commits when there are changes
- Check the Actions tab for workflow run logs
- Verify `daily-log.txt` is being updated

### Permission denied errors?

- The workflow uses `GITHUB_TOKEN` which is automatically provided
- Ensure `permissions: contents: write` is set in the workflow file

## 📜 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## ⚠️ Important Notes

- This workflow commits to your **main** branch by default
- Ensure you want automated commits before enabling
- The workflow will not run if the repository has no changes
- GitHub Actions have usage limits on free plans (2,000 minutes/month for free accounts)

## 🎯 Use Cases

- Maintaining GitHub contribution streaks
- Automated daily backups
- Tracking daily progress logs
- Keeping activity history
- Automated data collection commits
