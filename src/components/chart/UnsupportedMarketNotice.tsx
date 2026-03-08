type Props = {
    symbol: string;
    reason?: string;
};

export default function UnsupportedMarketNotice({
    symbol,
    reason,
}: Props) {
    return (
        <div className="flex h-[420px] w-full items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-950/60 p-6">
            <div className="max-w-xl text-center">
                <div className="mb-3 inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                    Market data not available yet
                </div>

                <h3 className="text-lg font-semibold text-white">
                    {symbol} is registered, but its data provider is not implemented yet.
                </h3>

                <p className="mt-3 text-sm leading-6 text-zinc-400">
                    The dashboard is working correctly. This asset class is already wired
                    into the shared architecture, but live candle data has not been
                    connected yet.
                </p>

                {reason ? (
                    <p className="mt-4 text-sm text-zinc-500">
                        Reason: <span className="text-zinc-300">{reason}</span>
                    </p>
                ) : null}
            </div>
        </div>
    );
}