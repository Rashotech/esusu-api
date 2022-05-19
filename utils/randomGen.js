exports.generateRandom = (members) => {
    const range = [...Array(members.length).keys()].map(x => x + 1);
    const random = [];
    for (let a = range, i = a.length; i--;) {
      const RandomNumber = a.splice(Math.floor(Math.random() * (i + 1)), 1)[0];
      const mem = {
          rank: RandomNumber,
          id: members[i]._id
      }
      random.push(mem)
    };
    return random;
};
