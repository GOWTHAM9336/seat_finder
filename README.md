#  College Exam Seat Finder (static, no database)

Plain HTML site. No backend, no database, no password, no environment variables.

- `index.html`: student page (register number + session + date -> hall, row, column, seat). Seats show from 60 minutes before the exam (`RELEASE_MINUTES` at the top of the script).
- `admin.html`: exam cell page. Allocates seats and produces `seating.json`.
- `seating.json`: the allocation data the student page reads.
- `sample/`: sample student CSV.

## Publish seating for an exam
1. Open `/admin.html`, pick date, session and start time, upload the students CSV, enter halls, click **Allocate seats**.
2. Click **Download seating.json**.
3. Replace `seating.json` in this repo (GitHub -> Add file -> Upload files, or `git add . && git commit && git push`).
4. Vercel redeploys automatically. Students can look up seats from 1 hour before the exam.

## Important
`seating.json` is a public file. The 1-hour rule is enforced in the browser only, so someone who opens `/seating.json` directly can see all seats. Use this version only if seating is normally displayed publicly (as on a notice board).
