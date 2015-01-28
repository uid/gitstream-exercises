repo="$(git config remote.origin.url)"
baseUrl=${repo%%/repos*}
anglerUrl="$baseUrl/hooks"

git config angler.url "$anglerUrl"
gitroot="$(git rev-parse --show-toplevel)"

curl -sfH "X-GitStream-Repo: $repo" "$baseUrl/go"
if [ $? != 0 ]; then echo 'GitStream: Unable to connect to server.'; exit 1; fi

# remove hooks to prevent the following from triggering events
rm "$gitroot"/.git/hooks/*

# remove added remotes and refs
git remote | grep -v "^origin$" | xargs -rL 1 git remote remove
git remote prune origin > /dev/null 2>&1
git show-ref --tags --heads | grep -v "/master$" | cut -d" " -f 2 | xargs -rL 1 git update-ref -d > /dev/null 2>&1

# move back to master, clean up the sandbox, and reset to origin state
git checkout -f master > /dev/null 2>&1
git reset --hard HEAD > /dev/null 2>&1
git clean -df > /dev/null 2>&1
git fetch origin > /dev/null 2>&1
git reset --hard origin/master > /dev/null 2>&1

# remove unnecessary blobs
git reflog expire --expire=now --all > /dev/null 2>&1
git gc --prune=now > /dev/null 2>&1

# run the setup script, if one is provided
"$gitroot"/.gitstream/setup.sh > /dev/null 2>&1

# reinstate the hooks
cp "$gitroot"/.gitstream/hooks/* "$gitroot"/.git/hooks/

# let the user know that everything went well
echo "GitStream: Follow the instructions in your browser!"
