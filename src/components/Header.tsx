import { useState } from 'react';
import { Link, Button } from 'react-aria-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars } from '@fortawesome/free-solid-svg-icons';

import logo from '../assets/logo.svg';
import Navbar from './Navbar.tsx';

const baseURL = import.meta.env.BASE_URL;

export default function Header ({ links }) {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const toggleNav = () => setIsOpened(!isOpened);

  return (
    <header className='mt-12 px-6'>
      <div className='flex flex-row justify-between items-center'>
        <Link href={baseURL}>
          <img className="header__logo" src={logo.src} alt="shortly - url shortener" loading="eager" />
        </Link>

        <Button onPress={toggleNav} className="w-[24px] outline-none">
          <FontAwesomeIcon icon={faBars} size="2x" style={{color: '#9E9AA8'}} />
        </Button>
      </div>
      <div className={`lg:hidden ${isOpened ? 'flex' : 'hidden'} flex-col lg:flex-row justify-center items-center lg:bg-transparent bg-dark-violet rounded-lg mt-2`}>
        <Navbar links={links} />
      </div>
    </header>
  );
}