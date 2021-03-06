import { useState, useEffect } from 'react';

const useSortedPools = (pools, apys) => {
  const [order, setOrder] = useState('default');
  const [sortedPools, setSortedPools] = useState(pools);

  useEffect(() => {
    switch (order) {
      case 'apy':
        setSortedPools(handleApy(pools, apys));
        break;
      case 'tvl':
        setSortedPools(handleTvl(pools));
        break;
      default:
        setSortedPools(pools);
        break;
    }
  }, [pools, apys, order]);

  return { sortedPools, order, setOrder };
};

const handleApy = (pools, apys) => {
  let newPools = [...pools];
  return newPools.sort((a, b) => {
    return apys[b.id] - apys[a.id];
  });
};

const handleTvl = pools => {
  let newPools = [...pools];
  return newPools.sort((a, b) => {
    const aPrice = a.oraclePrice;
    const bPrice = b.oraclePrice;
    return b.tvl * bPrice - a.tvl * aPrice;
  });
};

export default useSortedPools;
