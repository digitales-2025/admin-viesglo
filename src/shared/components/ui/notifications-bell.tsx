"use client";

import { useState } from "react";
import { AlertTriangle, Bell, Calendar, CheckCircle, Clock, FileText, Users, X } from "lucide-react";

import { Badge } from "./badge";
import { Button } from "./button";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  type: "info" | "warning" | "success" | "error";
  category: "project" | "milestone" | "deliverable" | "assignment" | "approval";
  projectName?: string;
  milestoneName?: string;
  deliverableName?: string;
  assignedBy?: string;
  priority: "baja" | "media" | "alta";
}

// Datos mockeados específicos para gestión de proyectos ISO
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Entregable con retraso",
    message: "El entregable 'Manual de Procedimientos ISO 9001' está 3 días retrasado",
    time: "hace 15 min",
    isRead: false,
    type: "error",
    category: "deliverable",
    projectName: "Implementación ISO 9001 - TechCorp",
    milestoneName: "Documentación del SGC",
    deliverableName: "Manual de Procedimientos ISO 9001",
    priority: "alta",
  },
  {
    id: "2",
    title: "Nuevo proyecto asignado",
    message: "Se te ha asignado el proyecto 'Implementación ISO 14001 - EcoIndustrias'",
    time: "hace 30 min",
    isRead: false,
    type: "info",
    category: "assignment",
    projectName: "Implementación ISO 14001 - EcoIndustrias",
    assignedBy: "Management Test",
    priority: "alta",
  },
  {
    id: "3",
    title: "Cronograma pendiente",
    message: "Debes generar el cronograma de entregables para el hito 'Auditoría Interna'",
    time: "hace 1 hora",
    isRead: false,
    type: "warning",
    category: "milestone",
    projectName: "Implementación ISO 45001 - SafeWork",
    milestoneName: "Auditoría Interna",
    priority: "media",
  },
  {
    id: "4",
    title: "Entregable completado",
    message: "El entregable 'Matriz de Riesgos' ha sido marcado como completado",
    time: "hace 2 horas",
    isRead: false,
    type: "success",
    category: "deliverable",
    projectName: "Implementación ISO 45001 - SafeWork",
    milestoneName: "Identificación de Peligros",
    deliverableName: "Matriz de Riesgos",
    priority: "baja",
  },
  {
    id: "5",
    title: "Aprobación pendiente",
    message: "El hito 'Capacitación del Personal' requiere tu aprobación",
    time: "hace 3 horas",
    isRead: false,
    type: "warning",
    category: "approval",
    projectName: "Implementación ISO 9001 - TechCorp",
    milestoneName: "Capacitación del Personal",
    priority: "media",
  },
  {
    id: "6",
    title: "Reunión programada",
    message: "Reunión de seguimiento del proyecto ISO 27001 programada para mañana 10:00 AM",
    time: "hace 4 horas",
    isRead: true,
    type: "info",
    category: "project",
    projectName: "Implementación ISO 27001 - DataSecure",
    priority: "media",
  },
  {
    id: "7",
    title: "Hito próximo a vencer",
    message: "El hito 'Implementación de Controles' vence en 2 días",
    time: "hace 5 horas",
    isRead: true,
    type: "warning",
    category: "milestone",
    projectName: "Implementación ISO 27001 - DataSecure",
    milestoneName: "Implementación de Controles",
    priority: "alta",
  },
  {
    id: "8",
    title: "Proyecto completado",
    message: "El proyecto 'Implementación ISO 22000 - FoodSafe' ha sido completado exitosamente",
    time: "hace 1 día",
    isRead: true,
    type: "success",
    category: "project",
    projectName: "Implementación ISO 22000 - FoodSafe",
    priority: "baja",
  },
];

const getTypeColor = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return "bg-green-50 border-green-200";
    case "warning":
      return "bg-yellow-50 border-yellow-200";
    case "error":
      return "bg-red-50 border-red-200";
    default:
      return "bg-blue-50 border-blue-200";
  }
};

const getCategoryIcon = (category: Notification["category"]) => {
  switch (category) {
    case "project":
      return <FileText className="h-4 w-4" />;
    case "milestone":
      return <Calendar className="h-4 w-4" />;
    case "deliverable":
      return <CheckCircle className="h-4 w-4" />;
    case "assignment":
      return <Users className="h-4 w-4" />;
    case "approval":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

const getPriorityColor = (priority: Notification["priority"]) => {
  switch (priority) {
    case "alta":
      return "text-red-600";
    case "media":
      return "text-yellow-600";
    case "baja":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

export default function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="scale-95 rounded-full group relative">
          <Bell className="h-4 w-4 group-hover:animate-shake transition-transform" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs">
              Marcar todas como leídas
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">No tienes notificaciones</div>
          ) : (
            <div className="p-2">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div
                    className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 group ${
                      !notification.isRead ? getTypeColor(notification.type) : "bg-muted/20"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="mt-0.5 text-muted-foreground">{getCategoryIcon(notification.category)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={`text-sm font-medium truncate ${
                                !notification.isRead ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            {!notification.isRead && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                            <Badge
                              variant="outline"
                              className={`text-xs px-1.5 py-0.5 capitalize ${getPriorityColor(notification.priority)}`}
                            >
                              {notification.priority}
                            </Badge>
                          </div>
                          <p
                            className={`text-xs mb-2 ${
                              !notification.isRead ? "text-foreground/80" : "text-muted-foreground"
                            }`}
                          >
                            {notification.message}
                          </p>
                          {notification.projectName && (
                            <div className="text-xs text-muted-foreground mb-1">
                              <span className="font-medium">Proyecto:</span> {notification.projectName}
                            </div>
                          )}
                          {notification.milestoneName && (
                            <div className="text-xs text-muted-foreground mb-1">
                              <span className="font-medium">Hito:</span> {notification.milestoneName}
                            </div>
                          )}
                          {notification.deliverableName && (
                            <div className="text-xs text-muted-foreground mb-1">
                              <span className="font-medium">Entregable:</span> {notification.deliverableName}
                            </div>
                          )}
                          {notification.assignedBy && (
                            <div className="text-xs text-muted-foreground mb-1">
                              <span className="font-medium">Asignado por:</span> {notification.assignedBy}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeNotification(notification.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-1" />}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <div className="p-3 border-t">
            <Button variant="outline" className="w-full text-xs bg-transparent">
              Ver todas las notificaciones
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
