import mascotImg from "@/assets/mascot.png";

interface PointsCardProps {
  points: number;
  displayName?: string | null;
}

export function PointsCard({ points, displayName }: PointsCardProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-coral p-6 text-primary-foreground shadow-lg">
      <div className="absolute -right-4 -top-4 opacity-20">
        <div className="h-32 w-32 rounded-full bg-primary-foreground" />
      </div>
      <div className="flex items-center gap-4">
        <img
          src={mascotImg}
          alt="LoyaltyBuddy mascot"
          width={80}
          height={80}
          className="drop-shadow-lg"
        />
        <div>
          <p className="text-sm opacity-90">
            {displayName ? `Hi, ${displayName}!` : "Welcome back!"}
          </p>
          <p className="text-4xl font-extrabold tracking-tight">{points}</p>
          <p className="text-sm font-semibold opacity-90">Total Points ⭐</p>
        </div>
      </div>
    </div>
  );
}