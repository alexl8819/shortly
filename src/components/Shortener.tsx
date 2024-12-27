import { 
    Button, 
    Form, 
    TextField,
    FieldError, 
    Label, 
    Input 
} from 'react-aria-components';
import { toast } from 'react-toastify';
import delay from 'delay';
import clipboard from 'clipboardy';
import PropTypes from 'prop-types';
import { useEffect, useState, type FormEvent, type FC } from 'react';

import { useShortener } from '../contexts/ShortenerContext';
import { QUERY_LIMIT, VALID_URL } from '../lib/constants';
import { WidgetSkeleton } from './Skeleton';

interface ShortenedUrl {
    original: string,
    shortened: string
}

interface ShortenerProps {
    isLoggedIn: boolean
}

const notifySuccess = (linkAdded: string) => toast.success(`Shortened URL (${linkAdded}) has been copied to clipboard`, { 
    role: 'alert'
});

export const ShortenerWidget: FC<ShortenerProps> = ({ isLoggedIn }) => {
    const { 
        total, 
        cursor, 
        setCursor,
        isLoading
    } = useShortener();

    const [longUrlInput, setLongUrlInput] = useState<string>('');
    const [shortenedLinks, setShortenedLinks] = useState<Array<ShortenedUrl>>([]);
    const [_window, setWindow] = useState<Window | null>(null);

    const queueLink = async (e: FormEvent) => {
        e.preventDefault();

        if (!longUrlInput.length || !VALID_URL.test(longUrlInput)) {
            return;
        }

        if (!isLoggedIn) {
            _window?.location.replace('/login');
            return;
        }

        const shortened = await createShortUrl(longUrlInput);

        if (!shortened) {
            throw new Error('Failed to create shortened url');
        }
      
        setLongUrlInput('');

        if (window && (_window?.location.pathname.slice(1) === 'dashboard')) {
            const last = Math.floor(total / QUERY_LIMIT);

            if (cursor === last) {
                setCursor(-1);
            }
            
            await delay(500);
            setCursor(last);
            notifySuccess(shortened);
            await clipboard.write(shortened);
        } else {
            setShortenedLinks((prev) => [...prev, {
                original: longUrlInput,
                shortened
            }]);
        }
    };

    useEffect(() => {
        if (window) {
            setWindow(window);
        }
    }, []);

    return (
        <>
            <Form onSubmit={queueLink} className='lg:p-10 p-6 flex lg:flex-row flex-col bg-dark-violet rounded-xl bg-no-repeat bg-right-top lg:bg-bg-shorten-desktop bg-bg-shorten-mobile'>
                <TextField className='w-full' isRequired>
                    <Label htmlFor='link' className='sr-only'>Enter URL to shorten</Label>
                    <Input 
                        type='url' 
                        id='link-create-input' 
                        name='link-create-input' 
                        className={`rounded py-3 px-6 w-full ${longUrlInput.length > 0 ? 'invalid:border-2 invalid:border-red': 'border-none'}`}
                        value={longUrlInput}
                        placeholder='Shorten a link here...'
                        onChange={({ target }) => setLongUrlInput(target.value)}
                        disabled={isLoading}
                    />
                    <FieldError className='mt-[0.25rem] font-medium text-[0.75rem] tracking-[0.005em] leading-[1.125rem] text-red italic'>
                        {
                            ({validationDetails}) => (longUrlInput.length > 0 && (validationDetails.valueMissing || !validationDetails.valid) ? 'Please enter a valid URL' : '')
                        }
                    </FieldError>
                </TextField>
                <Button 
                    type='submit' 
                    className='lg:mt-0 mt-4 lg:ml-6 lg:py-0 py-3 lg:px-12 px-6 rounded-lg hover:bg-light-cyan bg-cyan text-white lg:w-auto w-full lg:max-h-[3.15rem] text-center cursor-pointer disabled:bg-gray disabled:cursor-not-allowed'
                    isDisabled={isLoading}
                >
                    Shorten
                </Button>
            </Form>
            {
                _window && (_window?.location.pathname.slice(1) !== 'dashboard') ? (
                    <ul className='mt-6 list-none'>
                        { 
                            shortenedLinks.map((shorten: ShortenedUrl, index: number) => (<ShortenedLinkPreview key={index} shorten={shorten} />))
                        }
                    </ul>
                ) : null
            }
        </>
    )
}

export default ShortenerWidget;

interface ShortenedLinkPreviewProps {
    shorten: ShortenedUrl
}

const ShortenedLinkPreview: FC<ShortenedLinkPreviewProps> = ({ shorten }) => {
    const [hasCopied, setHasCopied] = useState(false);

    const { original, shortened } = shorten;
    
    const copyShortened = async () => {
        setHasCopied(true);
        await clipboard.write(shortened);
        await delay(2500);
        setHasCopied(false);
    };
    
    return (
        <li className='mb-6 flex lg:flex-row flex-col bg-white text-left w-full'>
            <div className='lg:px-4 lg:mb-2 mb-4 flex lg:flex-row flex-col lg:justify-between items-center lg:space-y-0 space-y-2 lg:divide-none divide-y divide-grayish-violet overflow-x-auto w-full'>
                <div className='lg:text-left font-medium lg:text-[1.25rem] text-[1rem] leading-9 text-very-dark-blue lg:w-1/2 w-full truncate'>{ original }</div>
                <div className='lg:pt-0 pt-2 lg:text-right font-medium lg:text-[1.25rem] text-[1rem] text-cyan lg:w-1/2 w-full'>{ shortened }</div>
            </div>
            <Button 
                onPress={copyShortened} 
                className={`lg:ml-4 py-2 lg:px-10 px-6 rounded-lg ${hasCopied ? 'bg-dark-violet' : 'bg-cyan'} font-bold text-[1rem] text-white lg:w-auto w-full`}
                isDisabled={hasCopied}
            >
                { hasCopied ? 'Copied!' : 'Copy' }
            </Button>
        </li>
    );
}

ShortenedLinkPreview.propTypes = {
    shorten: PropTypes.any.isRequired
};

async function createShortUrl (originalUrl: string) {
    const serializedBody = new URLSearchParams();
    serializedBody.append('originalUrl', originalUrl);

    let shortUrlResponse;

    try {
        shortUrlResponse = await fetch('/api/link', {
            method: 'POST',
            body: serializedBody
        });
    } catch (err) {
        console.error(err);
        return null;
    }

    if (!shortUrlResponse.ok) {
        console.error(shortUrlResponse.status);
        return null;
    }

    const shortUrlData = await shortUrlResponse.json();
    return shortUrlData['url'];
}