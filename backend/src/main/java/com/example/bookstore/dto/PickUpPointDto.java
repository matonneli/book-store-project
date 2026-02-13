package com.example.bookstore.dto;

public class PickUpPointDto {

    private Integer pickupPointId;
    private String name;
    private String address;
    private String contactPhone;
    private String workingHours;
    private Boolean isActive;

    public PickUpPointDto() {}
    public PickUpPointDto(Integer pickupPointId, String name, String address, String contactPhone, String workingHours, Boolean isActive) {
        this.pickupPointId = pickupPointId;
        this.name = name;
        this.address = address;
        this.contactPhone = contactPhone;
        this.workingHours = workingHours;
        this.isActive = isActive;
    }
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
