import * as Solana from '@solana/web3.js';
import React, {useCallback, useMemo} from 'react';
import {StyleSheet, View} from 'react-native';
import {Headline, Text} from 'react-native-paper';
import useSWR from 'swr';

type Props = Readonly<{
  publicKey: PublicKey;
}>;

export default function AccountBalance({publicKey}: Props) {
  const connection = new Solana.Connection("devnet");
  const balanceFetcher = useCallback(
    async function ([_, selectedPublicKey]: [
      'accountBalance',
      Solana.PublicKey,
    ]): Promise<number> {
      return await connection.getBalance(selectedPublicKey);
    },
    [connection],
  );
  const {data: lamports} = useSWR(
    ['accountBalance', publicKey],
    balanceFetcher,
    {
      suspense: true,
    },
  );
  const balance = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {maximumFractionDigits: 1}).format(
        (lamports || 0) / Solana.LAMPORTS_PER_SOL,
      ),
    [lamports],
  );

  return (
    <View style={styles.container}>
        <Headline>Balance: </Headline>
          <Text style={styles.currencySymbol} variant="headlineLarge">
              {'\u25ce'}
          </Text>
      <Headline>{balance}</Headline>
    </View>
  
  );
}

export function AccountInfo({publicKey}: Props) {
  const {connection} = useConnection();
  const accountInfoFetcher = useCallback(
    async function ([_, selectedPublicKey]: [
      'accountInfo',
      Solana.PublicKey,
    ]): Promise<Solana.AccountInfo<Buffer>> {
      return await connection.getAccountInfo(selectedPublicKey);
    },
    [connection],
  );
  const {data: lamports} = useSWR(
    ['accountInfo', publicKey],
    accountInfoFetcher,
    {
      suspense: true,
    },
  );
  const accountInfo = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {maximumFractionDigits: 1}).format(
        (lamports || 0) / Solana.LAMPORTS_PER_SOL,
      ),
    [lamports],
  );

  return (
    <View style={styles.container}>
        <Headline>Lamports: </Headline>
          <Text variant="headlineLarge">
              {'\u25ce'}
          </Text>
      <Headline>{accountInfo.lamports}</Headline>
    </View>
  
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
  },
  currencySymbol: {
    marginRight: 4,
  },
});