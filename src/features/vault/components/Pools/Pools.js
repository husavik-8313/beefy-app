import React, { useEffect } from 'react';
import Web3 from 'web3'
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';

import { useConnectWallet } from '../../../home/redux/hooks';
import { useFetchBalances, useFetchPoolBalances, useFetchUserPoolBalances, useFetchContractApy } from '../../redux/hooks';
import VisiblePools from '../VisiblePools/VisiblePools';
import styles from './styles';
import usePoolsTvl from '../../hooks/usePoolsTvl';
import { formatGlobalTvl } from 'features/helpers/format';

const FETCH_INTERVAL_MS = 30 * 1000;
const web3Default = new Web3('https://bsc-dataseed.binance.org');

const useStyles = makeStyles(styles);

export default function Pools() {
  const { t } = useTranslation();
  const { web3, address } = useConnectWallet();
  const { pools, fetchPoolBalances } = useFetchPoolBalances();
  const { fetchUserPoolBalances } = useFetchUserPoolBalances();
  const { tokens, fetchBalances } = useFetchBalances();
  const { contractApy, fetchContractApy } = useFetchContractApy();
  const { poolsTvl } = usePoolsTvl(pools);
  const classes = useStyles();

  useEffect(() => {
    if (address && web3) {
      fetchBalances({ address, web3, tokens });
      fetchUserPoolBalances({ address, web3, pools });
      fetchContractApy();
      const id = setInterval(() => {
        fetchBalances({ address, web3, tokens });
        fetchUserPoolBalances({ address, web3, pools });
        fetchContractApy();
      }, FETCH_INTERVAL_MS);
      return () => clearInterval(id);
    }

    // Adding tokens and pools to this dep list, causes an endless loop, DDoSing the api
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, web3, fetchBalances, fetchPoolBalances, fetchUserPoolBalances]);

  useEffect(() => {
    fetchContractApy();
  }, [pools, fetchContractApy]);
  
  useEffect(() => {
    if (pools.length > 0 && pools[0].oraclePrice === 0) {
      fetchPoolBalances({ web3: web3Default, pools });
    }
  }, [pools, fetchPoolBalances]);

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12}>
        <div className={classes.titles}>
          <h1 className={classes.title}>{t('Vault-MainTitle')}</h1>
          <h1 className={classes.title}>TVL {formatGlobalTvl(poolsTvl)}</h1>
        </div>
        <div className={classes.subtitles}>
          <h3 className={classes.subtitle}>{t('Vault-SecondTitle')}</h3>
          <h3 className={classes.subtitle}>{t('Vault-WithdrawFee')}</h3>
        </div>
      </Grid>

      <VisiblePools pools={pools} apys={contractApy} tokens={tokens} />
    </Grid>
  );
}
