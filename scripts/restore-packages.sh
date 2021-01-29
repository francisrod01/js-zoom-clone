cd projects

# Delete node_modules from the current working directory.
find . -name 'node_modules' -type d -exec rm -rf '{}' +

for item in `ls`;
do
  echo $item
  cd $item
  npm ci --sident
  cd ..
done
