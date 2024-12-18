import { useState, type FC, type FormEvent } from 'react';
import { Form, Label, Input, Button } from 'react-aria-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

import { VALID_URL } from '../lib/constants';

interface LinkEditorProps {
    url: string,
    shortId: string,
    onSuccess: Function
}

export const LinkEditor: FC<LinkEditorProps> = ({ url, shortId, onSuccess }) => {
    const [newUrl, setNewUrl] = useState<string>(url);
    const [hasError, setHasError] = useState<boolean>(false);

    const handleUpdate = async (e: FormEvent) => {
        e.preventDefault();

        if (!VALID_URL.test(newUrl)) {
            setHasError(true);
            return;
        }

        let linkPatchResponse;

        const serializedBody = new URLSearchParams();
        serializedBody.append('shortId', shortId);
        serializedBody.append('new', newUrl);

        try {
            linkPatchResponse = await fetch(`/api/link/${shortId}`, {
                method: 'PATCH',
                body: serializedBody
            });
        } catch (err) {
            console.error(err);
            return;
        }

        if (!linkPatchResponse || !linkPatchResponse.ok) {
            setHasError(true);
            return;
        }

        onSuccess(newUrl);
    };

    return (
        <Form className='flex flex-row w-full' onSubmit={handleUpdate}>
            <Label htmlFor='url' className='sr-only'>Edit URL</Label>
            <Input 
                type='url' 
                name='url' 
                className={`${hasError ? 'border border-red' : ''} p-3 border-b focus:border-none border-very-dark-blue focus:outline-cyan w-full`}
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder='Enter a URL...' 
            />
            <Button type='submit' className='ml-3 hover:text-cyan text-grayish-violet'>
                <FontAwesomeIcon icon={faCheck} size='2x' />
            </Button>
        </Form>
    )
}

LinkEditor.propTypes = {
    url: PropTypes.string.isRequired,
    shortId: PropTypes.string.isRequired,
    onSuccess: PropTypes.func.isRequired
}

export default LinkEditor;