import { useState } from 'react';
import { Link } from 'react-aria-components';

import logo from '../assets/logo.svg';
import Navbar from './Navbar.tsx';

const baseURL = import.meta.env.BASE_URL;

export default function Header ({ links }) {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const toggleNav = () => setIsOpened(!isOpened);

  return (
    <header className={`mt-12 ${isOpened ? 'mb-[25rem]' : 'mb-0'} xl:px-[10.375rem] px-6`}>
      <div className='flex flex-row xl:justify-start justify-between items-center'>
        <Link href={baseURL}>
          <img className="header__logo" src={logo.src} alt="shortly - url shortener" loading="eager" />
        </Link>

        <Navbar isOpen={isOpened} toggle={toggleNav} links={links} />
      </div>
    </header>
  );
}