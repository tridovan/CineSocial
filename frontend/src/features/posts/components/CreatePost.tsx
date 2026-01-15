import { useForm } from 'react-hook-form';
import { Image, Video } from 'lucide-react';

export const CreatePost = () => {
    const { register, handleSubmit } = useForm();

    const onSubmit = (data: any) => {
        console.log(data);
    };

    return (
        <div className="bg-bg-card p-4 rounded-xl border border-white/10 mb-6">
            <form onSubmit={handleSubmit(onSubmit)}>
                <textarea
                    {...register('content')}
                    placeholder="What's on your mind?"
                    className="w-full bg-transparent text-white resize-none border-none focus:ring-0 text-lg placeholder-gray-500"
                    rows={3}
                />
                <div className="flex items-center justify-between mt-4 border-t border-white/10 pt-4">
                    <div className="flex gap-4">
                        <button type="button" className="text-brand-gold hover:text-white transition-colors">
                            <Image size={24} />
                        </button>
                        <button type="button" className="text-brand-red hover:text-white transition-colors">
                            <Video size={24} />
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="bg-brand-red text-white px-6 py-2 rounded-full font-bold hover:bg-red-700 transition-colors"
                    >
                        Post
                    </button>
                </div>
            </form>
        </div>
    );
};
