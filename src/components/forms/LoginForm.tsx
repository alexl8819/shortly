// import { Controller } from 'react-hook-form';
import { Form, Label, Input, Button, Link } from 'react-aria-components';

export default function LoginForm () {
    return (
        <Form encType='application/x-www-form-urlencoded' action='/api/auth/login' method='post' className='py-12 px-6 flex space-y-4 flex-col justify-center items-center bg-dark-violet bg-no-repeat bg-cover lg:bg-bg-boost-desktop bg-bg-boost-mobile rounded-lg w-full'>
            <div className='flex lg:flex-row flex-col justify-center items-center w-full'>
                <Label htmlFor='email' id='email' className='lg:w-auto w-full lg:min-w-[80px] lg:mr-3 lg:mb-0 mb-2 text-left text-white'>Email:</Label>
                <Input type='email' id='email' name='email' className='lg:w-2/3 w-full py-1.5 px-3 outline-none' />
            </div>
            <div className='flex lg:flex-row flex-col justify-center items-center w-full'>
                <Label htmlFor='password' id='password' className='lg:w-auto w-full lg:min-w-[80px] lg:mr-3 lg:mb-0 mb-2 text-left text-white'>Password:</Label>
                <Input type='password' id='password' name='password' className='lg:w-2/3 w-full py-1.5 px-3 outline-none' /> 
            </div>
            <div className='flex lg:flex-row flex-col justify-end items-center lg:w-2/3 w-full lg:ml-24 ml-0 text-sm text-white'>
                <Link href="/reset" className='underline underline-offset-4'>Forgot Password</Link>
            </div>
            <Button type='submit' className='mt-4 py-3 lg:px-12 px-6 rounded-lg hover:bg-light-cyan bg-cyan text-white lg:w-auto w-full text-center cursor-pointer disabled:cursor-not-allowed'>Sign In</Button>
        </Form>
    )
};

