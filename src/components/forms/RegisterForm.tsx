import { type FC, useState, useRef } from 'react'; 
import PropTypes from 'prop-types';
// import { Controller } from 'react-hook-form';
import { Form, Label, Input, Button } from 'react-aria-components';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface RegisterFormProps {
    siteKey: string
}

export const RegisterForm: FC<RegisterFormProps> = ({ siteKey }) => {
    const [captchaToken, setCaptchaToken] = useState<string>('');
    const captchaRef = useRef(null);

    const handleSubmit = () => {
        if (captchaRef.current) {
            (captchaRef.current as HCaptcha).resetCaptcha();
        }
    }

    return (
        <Form onSubmit={handleSubmit} encType='application/x-www-form-urlencoded' action='/api/auth/register' method='post' className='py-10 lg:px-6 px-3 flex space-y-4 flex-col justify-center items-center bg-dark-violet bg-no-repeat bg-cover lg:bg-bg-boost-desktop bg-bg-boost-mobile rounded-lg w-full'>
            <div className='flex lg:flex-row flex-col justify-center items-center w-full'>
                <Label htmlFor='email' id='email' className='lg:w-auto w-full lg:min-w-[80px] lg:mr-3 lg:mb-0 mb-2 text-left text-white'>Email:</Label>
                <Input type='email' id='email' name='email' className='lg:w-2/3 w-full py-1.5 px-3 outline-none' />
            </div>
            <div className='flex lg:flex-row flex-col justify-center items-center w-full'>
                <Label htmlFor='password' id='password' className='lg:w-auto w-full lg:min-w-[80px] lg:mr-3 lg:mb-0 mb-2 text-left text-white'>Password:</Label>
                <Input type='password' id='password' name='password' className='lg:w-2/3 w-full py-1.5 px-3 outline-none' /> 
            </div>
            <div className='lg:ml-[9.5rem] xl:ml-[10rem] mt-[1.25rem] lg:min-h-[80px] lg:w-3/4 w-full'>
                <Input type="hidden" id="captchaToken" name="captchaToken" value={captchaToken} />
                <HCaptcha ref={captchaRef} sitekey={siteKey} onVerify={(token) => setCaptchaToken(token)} />
            </div>
            <Button type='submit' className='mt-4 py-3 lg:px-12 px-6 rounded-lg hover:bg-light-cyan bg-cyan text-white lg:w-auto w-full text-center cursor-pointer disabled:cursor-not-allowed'>Create</Button>
        </Form>
    )
};

RegisterForm.propTypes = {
    siteKey: PropTypes.string.isRequired
};

export default RegisterForm;

