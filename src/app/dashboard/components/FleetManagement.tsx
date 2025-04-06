// components/FleetManagement.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  fetchTrips,
  fetchTripDetails,
  createTrip,
  updateTrip,
  deleteTrip,
  fetchRoutes,
} from "../actions";
import { toast } from "sonner";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";

interface Trip {
  id: string;
  route: { name: string };
  vehicleType: string;
  capacity: number;
  features?: string | null;
  date: Date;
  departureTime: Date;
  arrivalTime: Date;
  status: string;
  occupancyData?: { count: number; percentage: number }[];
  timetableEntry?: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    routeId: string;
    stopId: string;
    departureTime: string;
    isHoliday: boolean;
    isWeekday: boolean;
    isWeekend: boolean;
    validFrom: Date | null;
    validUntil: Date | null;
  } | null;
}

interface Route {
  id: string;
  name: string;
}

const mapApiDataToTrip = (apiData: any): Trip => {
  let timetableEntry = null;
  if (apiData.timetableEntry) {
    timetableEntry = {
      id: apiData.timetableEntry.id || "",
      createdAt: new Date(apiData.timetableEntry.createdAt || new Date()),
      updatedAt: new Date(apiData.timetableEntry.updatedAt || new Date()),
      routeId: apiData.timetableEntry.routeId || "",
      stopId: apiData.timetableEntry.stopId || "",
      departureTime: apiData.timetableEntry.departureTime || "",
      isHoliday: !!apiData.timetableEntry.isHoliday,
      isWeekday: !!apiData.timetableEntry.isWeekday,
      isWeekend: !!apiData.timetableEntry.isWeekend,
      validFrom: apiData.timetableEntry.validFrom
        ? new Date(apiData.timetableEntry.validFrom)
        : null,
      validUntil: apiData.timetableEntry.validUntil
        ? new Date(apiData.timetableEntry.validUntil)
        : null,
    };
  }

  return {
    id: apiData.id,
    route: apiData.route,
    vehicleType: apiData.vehicleType,
    capacity: apiData.capacity,
    features: apiData.features,
    date: new Date(apiData.date),
    departureTime: new Date(apiData.departureTime),
    arrivalTime: new Date(apiData.arrivalTime),
    status: apiData.status,
    occupancyData: apiData.occupancyData,
    timetableEntry: timetableEntry,
  };
};

export function FleetManagement() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalTrips, setTotalTrips] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const itemsPerPageOptions = [10, 20, 50, 100];

  const [createForm, setCreateForm] = useState({
    routeId: "",
    vehicleType: "",
    capacity: 0,
    features: "",
    date: new Date().toISOString().split("T")[0],
    departureTime: "00:00",
    arrivalTime: "00:00",
    status: "Scheduled",
  });
  const [editForm, setEditForm] = useState({});

  // Load routes on mount
  useEffect(() => {
    async function loadRoutes() {
      try {
        const routeData = await fetchRoutes();
        setRoutes(routeData);
      } catch (error) {
        toast.error("Failed to load routes");
      }
    }
    loadRoutes();
  }, []);

  // Load trips when page or items per page changes
  useEffect(() => {
    async function loadTrips() {
      setIsLoading(true);
      try {
        const { trips: tripData, total } = await fetchTrips(
          currentPage,
          itemsPerPage
        );
        setTrips(tripData.map(mapApiDataToTrip));
        setTotalTrips(total);
      } catch (error) {
        toast.error("Failed to load trips");
      } finally {
        setIsLoading(false);
      }
    }
    loadTrips();
  }, [currentPage, itemsPerPage]);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...createForm,
        capacity: parseInt(createForm.capacity as any),
        date: new Date(createForm.date),
        departureTime: new Date(
          `${createForm.date}T${createForm.departureTime}`
        ),
        arrivalTime: new Date(`${createForm.date}T${createForm.arrivalTime}`),
      };
      await createTrip(data);
      toast.success("Trip created successfully");
      setShowCreateModal(false);
      const { trips: tripData, total } = await fetchTrips(
        currentPage,
        itemsPerPage
      );
      setTrips(tripData.map(mapApiDataToTrip));
      setTotalTrips(total);
    } catch (error) {
      toast.error("Failed to create trip");
    }
  };

  const handleUpdateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrip) return;
    try {
      const data = {
        ...editForm,
        capacity: parseInt((editForm as any).capacity as any),
        date: new Date((editForm as any).date),
        departureTime: new Date(
          `${(editForm as any).date}T${(editForm as any).departureTime}`
        ),
        arrivalTime: new Date(
          `${(editForm as any).date}T${(editForm as any).arrivalTime}`
        ),
      };
      await updateTrip(selectedTrip.id, data);
      toast.success("Trip updated successfully");
      setShowEditModal(false);
      const { trips: tripData, total } = await fetchTrips(
        currentPage,
        itemsPerPage
      );
      setTrips(tripData.map(mapApiDataToTrip));
      setTotalTrips(total);
    } catch (error) {
      toast.error("Failed to update trip");
    }
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (confirm("Are you sure you want to delete this trip?")) {
      try {
        await deleteTrip(tripId);
        toast.success("Trip deleted successfully");
        const { trips: tripData, total } = await fetchTrips(
          currentPage,
          itemsPerPage
        );
        setTrips(tripData.map(mapApiDataToTrip));
        setTotalTrips(total);
      } catch (error) {
        toast.error("Failed to delete trip");
      }
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Fleet Management</h2>
      <Button onClick={() => setShowCreateModal(true)} className="mb-4">
        Add New Trip
      </Button>

      {isLoading && <div className="text-center py-4">Loading...</div>}

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-blue-800 text-white">
              <th className="p-2">Route</th>
              <th className="p-2">Vehicle Type</th>
              <th className="p-2">Status</th>
              <th className="p-2">Departure</th>
              <th className="p-2">Arrival</th>
              <th className="p-2">Occupancy</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((trip, index) => (
              <tr
                key={trip.id}
                className={`border-b ${
                  index % 2 === 0 ? "bg-gray-100" : "bg-white"
                } hover:bg-gray-50`}
              >
                <td className="p-2">{trip.route.name}</td>
                <td className="p-2">{trip.vehicleType}</td>
                <td className="p-2">{trip.status}</td>
                <td className="p-2">
                  {new Date(trip.departureTime).toLocaleString()}
                </td>
                <td className="p-2">
                  {new Date(trip.arrivalTime).toLocaleString()}
                </td>
                <td className="p-2">
                  {trip.occupancyData?.[0]
                    ? `${trip.occupancyData[0].percentage.toFixed(2)}%`
                    : "N/A"}
                </td>
                <td className="p-2 flex space-x-2">
                  <Button
                    onClick={async () => {
                      const details = await fetchTripDetails(trip.id);
                      setSelectedTrip(mapApiDataToTrip(details));
                      setShowDetailsModal(true);
                    }}
                  >
                    Details
                  </Button>
                  <Button
                    className="cursor-pointer border hover:border hover:border-blue-800"
                    onClick={() => {
                      setSelectedTrip(trip);
                      setEditForm({
                        vehicleType: trip.vehicleType,
                        capacity: trip.capacity,
                        features: trip.features || "",
                        date: new Date(trip.date).toISOString().split("T")[0],
                        departureTime: new Date(trip.departureTime)
                          .toTimeString()
                          .slice(0, 5),
                        arrivalTime: new Date(trip.arrivalTime)
                          .toTimeString()
                          .slice(0, 5),
                        status: trip.status,
                      });
                      setShowEditModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    className="bg-blue-800  cursor-pointer hover:bg-blue-700"
                    onClick={() => handleDeleteTrip(trip.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center space-x-2">
          <span>Show</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(parseInt(value));
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {itemsPerPageOptions.map((option) => (
                <SelectItem key={option} value={option.toString()}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || isLoading}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {Math.ceil(totalTrips / itemsPerPage)}
          </span>
          <Button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, Math.ceil(totalTrips / itemsPerPage))
              )
            }
            disabled={
              currentPage === Math.ceil(totalTrips / itemsPerPage) || isLoading
            }
          >
            Next
          </Button>
        </div>
      </div>

      {/* Modals remain unchanged for brevity; update occupancy in Details modal as shown below */}
      {showDetailsModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Trip Details</h3>
            <p>
              <strong>Route:</strong> {selectedTrip.route.name}
            </p>
            <p>
              <strong>Vehicle Type:</strong> {selectedTrip.vehicleType}
            </p>
            <p>
              <strong>Capacity:</strong> {selectedTrip.capacity}
            </p>
            <p>
              <strong>Features:</strong> {selectedTrip.features || "N/A"}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedTrip.date).toLocaleDateString()}
            </p>
            <p>
              <strong>Departure:</strong>{" "}
              {new Date(selectedTrip.departureTime).toLocaleString()}
            </p>
            <p>
              <strong>Arrival:</strong>{" "}
              {new Date(selectedTrip.arrivalTime).toLocaleString()}
            </p>
            <p>
              <strong>Status:</strong> {selectedTrip.status}
            </p>
            <p>
              <strong>Occupancy:</strong>{" "}
              {selectedTrip.occupancyData?.[0]
                ? `${
                    selectedTrip.occupancyData[0].count
                  } (${selectedTrip.occupancyData[0].percentage.toFixed(2)}%)`
                : "N/A"}
            </p>
            <div className="mt-4 flex justify-end">
              <Button onClick={() => setShowDetailsModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Create and Edit modals remain unchanged */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Create New Trip</h3>
            <form onSubmit={handleCreateTrip}>
              <Select
                onValueChange={(value: string) =>
                  setCreateForm({ ...createForm, routeId: value })
                }
                value={createForm.routeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map((route) => (
                    <SelectItem key={route.id} value={route.id}>
                      {route.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                className="mt-2"
                placeholder="Vehicle Type"
                value={createForm.vehicleType}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateForm({ ...createForm, vehicleType: e.target.value })
                }
              />
              <Input
                className="mt-2"
                type="number"
                placeholder="Capacity"
                value={createForm.capacity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateForm({
                    ...createForm,
                    capacity: parseInt(e.target.value),
                  })
                }
              />
              <Input
                className="mt-2"
                placeholder="Features"
                value={createForm.features}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateForm({ ...createForm, features: e.target.value })
                }
              />
              <Input
                className="mt-2"
                type="date"
                value={createForm.date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateForm({ ...createForm, date: e.target.value })
                }
              />
              <Input
                className="mt-2"
                type="time"
                value={createForm.departureTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateForm({
                    ...createForm,
                    departureTime: e.target.value,
                  })
                }
              />
              <Input
                className="mt-2"
                type="time"
                value={createForm.arrivalTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setCreateForm({ ...createForm, arrivalTime: e.target.value })
                }
              />
              <Select
                onValueChange={(value: string) =>
                  setCreateForm({ ...createForm, status: value })
                }
                value={createForm.status}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {["Scheduled", "Active", "Completed", "Cancelled"].map(
                    (status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedTrip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4">Edit Trip</h3>
            <form onSubmit={handleUpdateTrip}>
              <Input
                className="mt-2"
                placeholder="Vehicle Type"
                value={(editForm as any).vehicleType}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditForm({ ...editForm, vehicleType: e.target.value })
                }
              />
              <Input
                className="mt-2"
                type="number"
                placeholder="Capacity"
                value={(editForm as any).capacity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditForm({
                    ...editForm,
                    capacity: parseInt(e.target.value),
                  })
                }
              />
              <Input
                className="mt-2"
                placeholder="Features"
                value={(editForm as any).features}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditForm({ ...editForm, features: e.target.value })
                }
              />
              <Input
                className="mt-2"
                type="date"
                value={(editForm as any).date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditForm({ ...editForm, date: e.target.value })
                }
              />
              <Input
                className="mt-2"
                type="time"
                value={(editForm as any).departureTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditForm({ ...editForm, departureTime: e.target.value })
                }
              />
              <Input
                className="mt-2"
                type="time"
                value={(editForm as any).arrivalTime}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setEditForm({ ...editForm, arrivalTime: e.target.value })
                }
              />
              <Select
                onValueChange={(value: string) =>
                  setEditForm({ ...editForm, status: value })
                }
                value={(editForm as any).status}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {["Scheduled", "Active", "Completed", "Cancelled"].map(
                    (status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
