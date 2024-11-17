import { 
    Button, 
    Form, 
    TextField, 
    Label, 
    Input 
} from 'react-aria-components';
// import { useState } from 'react';

export default function ShortenerWidget () {
    return (
        <Form>
            <TextField>
                <Label className='sr-only'>Enter URL to shorten</Label>
                <Input className='rounded py-3 px-6 max-w-[17.438rem]' placeholder='Shorten a link here...' />
            </TextField>
            <Button className='mt-4 py-3 px-6 rounded bg-cyan text-white w-full'>Shorten It!</Button>
        </Form>
    )
}