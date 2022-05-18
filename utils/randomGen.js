//function to generate random numbers between 0 and members.length
getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

exports.shuffleMembers = (members) => {
  let i = members.length;
  let j = 0,
    temp;
  while (--i > 0) {
    j = getRandomInt(i + 1);
    temp = members[j];
    members[j] = members[i];
    members[i] = temp;
  }
  return members;
};
