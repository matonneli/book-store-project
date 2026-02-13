package com.example.bookstore.model;

import jakarta.persistence.*;

@Entity
@Table(name = "pickup_point")
public class PickUpPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer pickupPointId;
    @Column(nullable = false)
    private String name;
    @Column(nullable = false)
    private String address;
    @Column(length = 50)
    private String contactPhone;
    @Column(columnDefinition = "TEXT")
    private String workingHours;
    private Boolean isActive;

    public Integer getPickupPointId() { return pickupPointId; }
    public void setPickupPointId(Integer pickupPointId) { this.pickupPointId = pickupPointId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getWorkingHours() { return workingHours; }
    public void setWorkingHours(String workingHours) { this.workingHours = workingHours; }

    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean isActive) { this.isActive = isActive; }
}
