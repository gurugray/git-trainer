## Simple visualization tool for teaching git

Default setup [git-init.ru](http://io.git-init.ru/git-trainer/)

Commands supported:

````
git add
git commit

git branch BRANCH_NAME
git checkout -b BRANCH_NAME
git checkout BRANCH_NAME

git merge BRANCH_NAME
git rebase BRANCH_NAME

git reset HASH

git gc

git cherry-pick HASH #just for demo

git revert HASH  #just for demo
````

## Contribution
Before contribute please check errors and codestyle.

```
git clone …
npm install
vi …

#build
./node_modules/.bin/grunt start --target=dev

#check errors and codestyle
./node_modules/.bin/grunt lint

#fix codestyle ;)
vi …

#then commit and do pull-request
git commit …

```

### CC-BY Attribution Requirement
All materials in this repository are licensed under a [Creative Commons Attribution 3.0 License](http://creativecommons.org/licenses/by/3.0/).
