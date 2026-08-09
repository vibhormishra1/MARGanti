import React from "react";
import { Incident, IncidentPriority } from "@marg/domain";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock } from "lucide-react";

interface IncidentCardProps {
  incident: Incident;
  onClick?: (id: string) => void;
}

export function IncidentCard({ incident, onClick }: IncidentCardProps) {
  const getPriorityColor = (priority: IncidentPriority) => {
    switch (priority) {
      case IncidentPriority.CRITICAL: return "bg-red-600 text-white";
      case IncidentPriority.HIGH: return "bg-orange-500 text-white";
      case IncidentPriority.MEDIUM: return "bg-yellow-500 text-black";
      case IncidentPriority.LOW: return "bg-green-500 text-white";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick?.(incident.id)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate">
            {incident.title}
          </CardTitle>
          <Badge className={getPriorityColor(incident.priority)}>
            {incident.priority}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 text-sm text-gray-600">
        <p className="line-clamp-2 mb-2">{incident.description}</p>
        <div className="flex items-center text-xs text-gray-500 gap-1 mb-1">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{incident.location.address || "Location unavailable"}</span>
        </div>
        <div className="flex items-center text-xs text-gray-500 gap-1">
          <Clock className="w-3 h-3" />
          <span>{new Date(incident.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Badge variant="outline">{incident.status}</Badge>
      </CardFooter>
    </Card>
  );
}
