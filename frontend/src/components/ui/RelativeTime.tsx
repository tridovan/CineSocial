import { formatDistanceToNow } from 'date-fns';

export const RelativeTime = ({ date }: { date: string }) => {
    try {
        return (
            <span title={new Date(date).toLocaleString()}>
                {formatDistanceToNow(new Date(date), { addSuffix: true })}
            </span>
        );
    } catch (e) {
        return <span>{date}</span>;
    }
};
