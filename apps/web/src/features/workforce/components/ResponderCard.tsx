import React from "react";
import { Responder, ResponderStatus } from "@marg/domain";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone } from "lucide-react";

interface ResponderCardProps {
  responder: Responder;
}

export function ResponderCard({ responder }: ResponderCardProps) {
  const getStatusColor = (status: ResponderStatus) => {
    switch (status) {
      case ResponderStatus.ON_DUTY: return "bg-green-500 text-white";
      case ResponderStatus.DEPLOYED: return "bg-blue-500 text-white";
      case ResponderStatus.FATIGUED: return "bg-yellow-500 text-black";
      case ResponderStatus.INCAPACITATED: return "bg-red-500 text-white";
      default: return "bg-gray-200 text-gray-800";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-semibold truncate flex items-center gap-2">
            <User className="w-4 h-4" />
            {responder.contactInfo.email.split("@")[0]}
          </CardTitle>
          <Badge className={getStatusColor(responder.status)}>
            {responder.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4 text-sm text-gray-600">
        <div className="flex items-center text-xs text-gray-500 gap-1 mb-2">
          <Phone className="w-3 h-3" />
          <span>{responder.contactInfo.phone}</span>
        </div>
        <div className="flex flex-wrap gap-1 mt-2">
          {responder.skills.map((skill: string) => (
            <Badge key={skill} variant="outline" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
