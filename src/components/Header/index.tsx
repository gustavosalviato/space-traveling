/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import Link from 'next/link';
import styles from './header.module.scss';

export default function Header() {
  return (
    <header className={styles.container}>
      <Link href="/">
        <img src="/spacetraveling.svg" alt="logo" />
      </Link>
    </header>
  );
}
