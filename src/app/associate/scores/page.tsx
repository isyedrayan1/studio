"use client";


import { useState, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Trophy,
  Loader2,
  AlertCircle,
  Save,
  Lock,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  X,
  Clock,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { useTournament, useAuth } from "@/contexts";
import { useToast } from "@/hooks/use-toast";
import { uploadProofImage, validateProofImage } from "@/lib/firebase/storage";
import Image from "next/image";

// Free Fire BR Scoring System
const PLACEMENT_POINTS = [12, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0];
const KILL_POINTS = 1;

export default function AssociateScoresPage() {
  const { matches, days, scores, loading, error, setScore, getTeamById } = useTournament();
  const { associateAccount, userProfile } = useAuth();
  const { toast } = useToast();

  const [selectedDayId, setSelectedDayId] = useState<string>("");
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Local score edits (only for my team)
  const [localScore, setLocalScore] = useState<{ kills: number; placement: number } | null>(null);
  
  // Proof image state
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [proofImagePreview, setProofImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const myTeamId = associateAccount?.teamId;
  const myTeam = myTeamId ? getTeamById(myTeamId) : null;

  // Filter matches that include my team (either directly or via group)
  const myMatches = useMemo(() => {
    if (!myTeamId) return [];
    return matches.filter(m =>
      m.teamIds.includes(myTeamId) ||
      (myTeam?.groupId && m.groupIds.includes(myTeam.groupId))
    );
  }, [matches, myTeamId, myTeam]);

  const filteredMatches = selectedDayId ? myMatches.filter(m => m.dayId === selectedDayId) : myMatches;
  const selectedDay = days.find(d => d.id === selectedDayId);
  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  // Auto-select active day and live match
  useEffect(() => {
    if (!selectedDayId && days.length > 0) {
      const activeDay = days.find(d => d.status === "active");
      if (activeDay) {
        const activeDayMatches = myMatches.filter(m => m.dayId === activeDay.id);
        if (activeDayMatches.length > 0) {
          setSelectedDayId(activeDay.id);
        }
      } else if (myMatches.length > 0) {
        setSelectedDayId(myMatches[0].dayId);
      }
    }
  }, [days, selectedDayId, myMatches]);

  useEffect(() => {
    if (selectedDayId && !selectedMatchId && filteredMatches.length > 0) {
      const liveMatch = filteredMatches.find(m => m.status === "live");
      if (liveMatch) {
        setSelectedMatchId(liveMatch.id);
      } else if (filteredMatches.length > 0) {
        setSelectedMatchId(filteredMatches[0].id);
      }
    }
  }, [selectedDayId, selectedMatchId, filteredMatches]);

  // Get or initialize local score for my team
  const currentScore = useMemo(() => {
    if (!selectedMatch || !myTeamId) return null;

    // If we have local edit, use it
    if (localScore) {
      return localScore;
    }

    // Otherwise initialize from server data
    const existing = scores.find(s => s.matchId === selectedMatchId && s.teamId === myTeamId);
    return {
      kills: existing?.kills ?? 0,
      placement: existing?.placement ?? 1,
    };
  }, [selectedMatchId, selectedMatch, scores, localScore, myTeamId]);

  // Check if match is locked
  const isMatchLocked = selectedMatch?.locked ?? false;
  const canEdit = selectedDay?.status === "active" && selectedMatch?.status === "live" && !isMatchLocked;

  const updateLocalScore = (field: "kills" | "placement", value: number) => {
    if (!canEdit) {
      toast({
        title: "Cannot edit",
        description: isMatchLocked ? "Match is locked" : "Day or match not active",
        variant: "destructive"
      });
      return;
    }
    setLocalScore(prev => ({
      kills: prev?.kills ?? 0,
      placement: prev?.placement ?? 1,
      [field]: value,
    }));
  };

  const calculatePoints = (kills: number, placement: number): number => {
    const placementPts = PLACEMENT_POINTS[placement - 1] ?? 0;
    return kills * KILL_POINTS + placementPts;
  };

  // Handle proof image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const validation = validateProofImage(file);
    if (!validation.valid) {
      toast({
        title: "Invalid Image",
        description: validation.error,
        variant: "destructive"
      });
      return;
    }
    
    setProofImage(file);
    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setProofImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeProofImage = () => {
    setProofImage(null);
    setProofImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleManualSave = async () => {
    const saverId = userProfile?.id || associateAccount?.id;
    if (!selectedMatchId || !myTeamId || !currentScore || !saverId) {
      if (!saverId) {
        toast({ title: "Auth Error", description: "Could not identify user", variant: "destructive" });
      }
      return;
    }
    
    // Require proof image for associates
    if (!proofImage && !existingScore?.proofImageUrl) {
      toast({
        title: "Proof Required",
        description: "Please upload a screenshot as proof of your score",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaving(true);
    setIsUploading(true);
    
    try {
      let imageUrl = existingScore?.proofImageUrl;
      
      // Upload new image if selected
      if (proofImage) {
        imageUrl = await uploadProofImage(proofImage, selectedMatchId, myTeamId);
      }
      
      setIsUploading(false);
      await setScore(selectedMatchId, myTeamId, currentScore.kills, currentScore.placement, saverId, selectedDay?.type, imageUrl);
      setLocalScore(null);
      setProofImage(null);
      setProofImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      toast({
        title: "Score Submitted! ✓",
        description: `${currentScore.kills} kills, ${calculatePoints(currentScore.kills, currentScore.placement)} points. Awaiting admin verification.`,
        duration: 4000,
      });
    } catch (err: unknown) {
      console.error("Failed to save:", err);
      const errMsg = err instanceof Error ? err.message : "Failed to save";
      toast({ title: "Error", description: errMsg, variant: "destructive" });
    } finally {
      setIsSaving(false);
      setIsUploading(false);
    }
  };

  // Check if score has been submitted
  const existingScore = scores.find(s => s.matchId === selectedMatchId && s.teamId === myTeamId);
  const hasSubmittedScore = !!existingScore && existingScore.placement > 0;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-2 md:p-0">
        <Trophy className="h-8 w-8 md:h-12 md:w-12 text-primary flex-shrink-0" />
        <div>
          <h1 className="text-2xl md:text-5xl font-bold tracking-tight md:tracking-wider">Score Entry</h1>
          <p className="text-muted-foreground text-sm md:text-xl tracking-normal md:tracking-widest mt-0.5 md:mt-1">
            Enter kills and placement for {myTeam?.name || "your team"}.
          </p>
        </div>
      </div>

      {/* Scoring Guide */}
      <Card className="bg-muted/30">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold">Scoring System:</p>
              <p className="text-xs text-muted-foreground">1 Kill = {KILL_POINTS} point | Placement: 1st={PLACEMENT_POINTS[0]}pts, 2nd={PLACEMENT_POINTS[1]}pts, 3rd={PLACEMENT_POINTS[2]}pts... 12th={PLACEMENT_POINTS[11]}pts</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-semibold">Day</label>
          <Select value={selectedDayId} onValueChange={(v) => { setSelectedDayId(v); setSelectedMatchId(""); }}>
            <SelectTrigger className="h-10 md:h-12">
              <SelectValue placeholder="Select Day" />
            </SelectTrigger>
            <SelectContent>
              {days.map((day) => (
                <SelectItem key={day.id} value={day.id}>
                  <div className="flex items-center gap-2">
                    <span>Day {day.dayNumber}: {day.name}</span>
                    {day.status === "active" && <Badge variant="default" className="text-xs">Active</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold">Match</label>
          <Select value={selectedMatchId} onValueChange={setSelectedMatchId} disabled={!selectedDayId}>
            <SelectTrigger className="h-10 md:h-12">
              <SelectValue placeholder="Select Match" />
            </SelectTrigger>
            <SelectContent>
              {filteredMatches.map((match) => (
                <SelectItem key={match.id} value={match.id}>
                  <div className="flex items-center gap-2">
                    <span>Match {match.matchNumber}</span>
                    {match.status === "live" && <Badge variant="default" className="text-xs">Live</Badge>}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Score Entry */}
      {/* Content Area with min-height to stabilize layout */}
      <div className="min-h-[400px]">
        {error ? (
          <Card className="border-destructive">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <AlertCircle className="h-16 w-16 text-destructive mb-4" />
              <p className="text-xl text-destructive font-semibold">Connection Error</p>
            </CardContent>
          </Card>
        ) : loading ? (
          <Card className="border-dashed animate-pulse">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 text-muted-foreground/50 mb-4 animate-spin" />
              <p className="text-lg text-muted-foreground">Fetching tournament data...</p>
            </CardContent>
          </Card>
        ) : !myTeam ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="bg-muted rounded-full p-4 mb-4">
                <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <p className="text-xl text-muted-foreground font-medium">No team assigned</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Your account is not assigned to any team. Please contact the administrator.
              </p>
            </CardContent>
          </Card>
        ) : !selectedMatchId || !currentScore ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="bg-primary/10 rounded-full p-4 mb-4">
                <Trophy className="h-10 w-10 text-primary/50" />
              </div>
              <p className="text-xl text-muted-foreground font-medium">Select a Match</p>
              <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                Choose a day and match from the dropdowns above to start entering scores.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Submitted Score Display */}
            {hasSubmittedScore && (
              <Card className="border-green-600 bg-green-50 dark:bg-green-950/20 overflow-hidden">
                <div className="h-1 bg-green-600 w-full" />
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400 text-base md:text-lg">
                    <CheckCircle className="h-5 w-5" />
                    Score Submitted Successfully
                  </CardTitle>
                  {/* Verification Status */}
                  <div className="flex items-center gap-2 mt-2">
                    {existingScore?.verificationStatus === 'pending' && (
                      <Badge variant="outline" className="text-yellow-600 border-yellow-600 gap-1">
                        <Clock className="h-3 w-3" /> Pending Verification
                      </Badge>
                    )}
                    {existingScore?.verificationStatus === 'verified' && (
                      <Badge variant="default" className="bg-green-600 gap-1">
                        <ShieldCheck className="h-3 w-3" /> Verified by Admin
                      </Badge>
                    )}
                    {existingScore?.verificationStatus === 'rejected' && (
                      <Badge variant="destructive" className="gap-1">
                        <ShieldX className="h-3 w-3" /> Rejected
                      </Badge>
                    )}
                  </div>
                  {existingScore?.rejectionReason && (
                    <p className="text-sm text-destructive mt-2">
                      <strong>Reason:</strong> {existingScore.rejectionReason}
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    <div className="bg-background/50 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Kills</p>
                      <p className="text-xl md:text-2xl font-bold">{existingScore?.kills || 0}</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Placement</p>
                      <p className="text-xl md:text-2xl font-bold">#{existingScore?.placement || 0}</p>
                    </div>
                    <div className="bg-background/50 p-3 rounded-lg border border-green-100 dark:border-green-900/30">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground mb-1">Placement Pts</p>
                      <p className="text-xl md:text-2xl font-bold">{PLACEMENT_POINTS[(existingScore?.placement || 1) - 1] || 0}</p>
                    </div>
                    <div className="bg-green-600 p-3 rounded-lg text-white">
                      <p className="text-[10px] uppercase font-bold opacity-80 mb-1 text-white">Total Points</p>
                      <p className="text-xl md:text-2xl font-bold text-white">
                        {calculatePoints(existingScore?.kills || 0, existingScore?.placement || 1)}
                      </p>
                    </div>
                  </div>

                  {(existingScore?.isBooyah || existingScore?.hasChampionRush) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {existingScore?.isBooyah && (
                        <Badge variant="default" className="bg-green-600">🏆 Booyah!</Badge>
                      )}
                      {existingScore?.hasChampionRush && (
                        <Badge variant="destructive">🔥 Champion Rush</Badge>
                      )}
                    </div>
                  )}

                  {canEdit && (
                    <div className="mt-4 pt-4 border-t border-border/40">
                      <p className="text-xs text-muted-foreground">
                        Editing is enabled. You can adjust the score below until the match is locked.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Score Entry Form */}
            <Card className="shadow-md">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                <div>
                  <CardTitle className="text-lg md:text-xl">
                    {hasSubmittedScore ? "Update Score" : "Score Entry"} - {myTeam.name}
                  </CardTitle>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {isMatchLocked && (
                      <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 h-5 uppercase">
                        <Lock className="h-3 w-3" /> Locked
                      </Badge>
                    )}
                    {!canEdit && !isMatchLocked && (
                      <Badge variant="outline" className="text-[10px] px-1.5 h-5 uppercase">
                        {selectedDay?.status !== "active" ? "Day Inactive" : "Match Not Live"}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  onClick={handleManualSave}
                  disabled={isSaving || !canEdit}
                  className="w-full sm:w-auto gap-2 font-bold"
                  size="lg"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {hasSubmittedScore ? "Update" : "Submit"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Kills</label>
                      <Input
                        type="number"
                        min={0}
                        placeholder="0"
                        value={currentScore.kills === 0 ? "" : currentScore.kills}
                        onChange={(e) => updateLocalScore("kills", parseInt(e.target.value) || 0)}
                        disabled={!canEdit}
                        className="text-center font-bold text-2xl h-16 cursor-text transition-all focus:ring-2 ring-primary/20 placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Placement (1-12)</label>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        placeholder="0"
                        value={currentScore.placement === 1 ? "" : currentScore.placement}
                        onChange={(e) => updateLocalScore("placement", parseInt(e.target.value) || 1)}
                        disabled={!canEdit}
                        className="text-center font-bold text-2xl h-16 cursor-text transition-all focus:ring-2 ring-primary/20 placeholder:text-muted-foreground/50"
                      />
                    </div>
                    <div className="space-y-2 sm:col-span-2 md:col-span-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Points</label>
                      <div className="h-16 flex items-center justify-center border-2 border-primary/20 rounded-md bg-primary/5">
                        <span className="text-4xl font-bold text-primary">
                          {calculatePoints(currentScore.kills, currentScore.placement)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/40 rounded-lg border border-border/40">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Scoring Guide</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-y-2 text-[10px]">
                      <div>1st: <span className="font-bold">{PLACEMENT_POINTS[0]}</span></div>
                      <div>2nd: <span className="font-bold">{PLACEMENT_POINTS[1]}</span></div>
                      <div>3rd: <span className="font-bold">{PLACEMENT_POINTS[2]}</span></div>
                      <div>4th: <span className="font-bold">{PLACEMENT_POINTS[3]}</span></div>
                      <div>5th: <span className="font-bold">{PLACEMENT_POINTS[4]}</span></div>
                      <div>6th: <span className="font-bold">{PLACEMENT_POINTS[5]}</span></div>
                      <div>Kills: <span className="font-bold">{KILL_POINTS} / kill</span></div>
                    </div>
                  </div>

                  {/* Proof Image Upload Section */}
                  <div className="p-4 bg-primary/5 rounded-lg border-2 border-primary/20 border-dashed">
                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      <p className="text-sm font-bold text-primary">Proof Screenshot (Required)</p>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      Upload a screenshot showing your kills and placement as proof. This will be verified by admin.
                    </p>
                    
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleImageSelect}
                      className="hidden"
                      disabled={!canEdit}
                    />
                    
                    {/* Show existing proof image */}
                    {existingScore?.proofImageUrl && !proofImagePreview && (
                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-2">Current proof image:</p>
                        <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-border">
                          <Image
                            src={existingScore.proofImageUrl}
                            alt="Proof screenshot"
                            fill
                            className="object-contain bg-muted"
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Preview selected image */}
                    {proofImagePreview && (
                      <div className="relative mb-4">
                        <p className="text-xs text-muted-foreground mb-2">New proof image:</p>
                        <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden border border-primary">
                          <Image
                            src={proofImagePreview}
                            alt="Proof preview"
                            fill
                            className="object-contain bg-muted"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={removeProofImage}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={!canEdit || isUploading}
                      className="gap-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          {proofImagePreview || existingScore?.proofImageUrl ? "Change Image" : "Upload Screenshot"}
                        </>
                      )}
                    </Button>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      Supported formats: JPEG, PNG, WebP, GIF (Max 5MB)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
