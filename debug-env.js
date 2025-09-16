// Debug script to check environment variables
console.log('=== Environment Variables Debug ===');
console.log('VITE_HUGGINGFACE_API_KEY:', import.meta.env.VITE_HUGGINGFACE_API_KEY);
console.log('All env vars:', import.meta.env);
console.log('Key exists:', !!import.meta.env.VITE_HUGGINGFACE_API_KEY);
console.log('Key length:', import.meta.env.VITE_HUGGINGFACE_API_KEY?.length);
console.log('Key starts with hf_:', import.meta.env.VITE_HUGGINGFACE_API_KEY?.startsWith('hf_'));