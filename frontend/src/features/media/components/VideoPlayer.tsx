import { Play } from 'lucide-react';

export const VideoPlayer = ({ src }: { src: string }) => {
    return (
        <div className="relative aspect-video bg-black rounded-xl overflow-hidden group">
            <video src={src} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play size={32} fill="white" />
                </div>
            </div>
        </div>
    );
};
